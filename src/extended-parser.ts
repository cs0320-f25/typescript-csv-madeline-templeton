import * as fs from "fs";
import * as readline from "readline";
import { z, ZodType } from "zod";

/**
 * Parse a CSV line respecting quotes and escaping rules
 */
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false; //if we are inside quotes, ignore delimiters (commas)
  let wasQuoted = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') { //check if next char is also a quote
        // Escaped quote (double quote) - add one quote to the output
        current += '"'; //appends a singlye quote to the current string being built
        i += 2;
      } else {
        // Start or end of quoted field
        if (!inQuotes) {
          wasQuoted = true;
        }
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === delimiter && !inQuotes) {
      // Field separator outside quotes
      // Only trim if the field wasn't quoted
      result.push(wasQuoted ? current : current.trim()); //trim whitespace if not quoted
      current = '';
      wasQuoted = false;
      i++;
    } else {
      // Regular character
      current += char;
      i++;
    }
  }
  
  // Add the last field because it won't be followed by a comma
    // Only trim if the field wasn't quoted
  result.push(wasQuoted ? current : current.trim());
  
  return result;
}

export class CSVParseError extends Error {
  constructor(
    public readonly rowNumber: number,
    public readonly rawLine: string,
    public readonly zodError: z.ZodError,
    public readonly rowIndex: number = rowNumber - 1,
    public readonly filePath?: string,
    public readonly delimiter: string = ','
  ) {
    super(CSVParseError.createUserFriendlyMessage(rowNumber, rawLine, zodError, filePath, delimiter));
    this.name = 'CSVParseError';
  }

  private static createUserFriendlyMessage(
    rowNumber: number, 
    rawLine: string, 
    zodError: z.ZodError, 
    filePath?: string,
    delimiter: string = ','
  ): string {
    const location = filePath ? `in file "${filePath}"` : ''; // Include file path if available
    const rawData = parseCSVLine(rawLine, delimiter);
    
    const issues = zodError.issues.map(issue => {
      const columnIndex = Array.isArray(issue.path) ? issue.path[0] : issue.path;
      const columnNumber = typeof columnIndex === 'number' ? columnIndex + 1 : 'unknown';
      const cellValue = typeof columnIndex === 'number' ? rawData[columnIndex] || 'empty' : 'unknown';
      
      if (issue.code === 'invalid_type' && issue.message.includes('number')) {
        return `Column ${columnNumber}: Expected a number, but got "${cellValue}" (non-numeric text)`;
      }
      
      // Simplify other error messages
      return `Column ${columnNumber}: ${issue.message.replace('Invalid input: expected ', 'Expected ').replace(', received ', ', but got ')}`;
    }).join('; ');

    return [
      `CSV validation failed at row ${rowNumber} ${location}`,
      `Raw data: "${rawLine}"`,
      `Problem: ${issues}`,
    ].join('\n');
  }
}

interface ParseOptions<T> { //should be the input for the parseCSV function telling it how to behave
  schema?: ZodType<T>;
  hasHeaders?: boolean;
  streaming?: boolean; // If true, returns an async generator for streaming parsing (line by line)
  delimiter?: string; // Support for custom field delimiters like semicolon, tab, pipe, etc.
}

// Overload for streaming mode
export function parseCSV<T>(
  path: string, 
  options: ParseOptions<T> & { streaming: true }
): AsyncGenerator<T | string[], void, unknown>;

// Overload for batch mode
export function parseCSV<T>(
  path: string, 
  options?: ParseOptions<T> & { streaming?: false }
): Promise<T[] | string[][] | {header: string[], data: T[] | string[][]}>; //return a tuple with header and data note that header is undefined if no header row

/**
 * Enhanced CSV parser implementation
 */
export function parseCSV<T>(
  path: string, 
  options?: ParseOptions<T>
): Promise<T[] | string[][] | {header: string[], data: T[] | string[][]}> | AsyncGenerator<T | string[], void, unknown> {
  
  // Default to empty options if none provided
  const opts: ParseOptions<T> = options || {};
  
  // If streaming is requested, return the generator
  if (opts.streaming) {
    return parseCSVGenerator(path, opts);
  }

  // Batch processing mode - collect all results
  return parseBatch(path, opts.schema, opts.hasHeaders, opts.delimiter || ','); //default delimiter is comma
}

// Internal generator function for streaming mode
async function* parseCSVGenerator<T>(path: string, options: ParseOptions<T>): AsyncGenerator<T | string[], void, unknown> {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const delimiter = options.delimiter || ',';
  let lineNumber = 0; // Track actual line number (1-based)
  let rowNumber = 0;  // Track data row number (1-based, excludes header)

  for await (const line of rl) {
    lineNumber++;
    const values = parseCSVLine(line, delimiter);

    // Skip header row if specified
    if (options.hasHeaders && lineNumber === 1) {
      continue;
    }
    
    rowNumber++;

    if (options.schema) {
      const parsed = options.schema.safeParse(values);
      if (!parsed.success) {
        throw new CSVParseError(
          options.hasHeaders ? lineNumber : rowNumber,
          line,
          parsed.error,
          options.hasHeaders ? lineNumber - 1 : rowNumber - 1,
          path,
          delimiter
        );
      }
      yield parsed.data;
    } else {
      yield values;
    }
  }
}

// Internal batch processing function 
async function parseBatch<T>(path: string, schema?: ZodType<T>, hasHeaders?: boolean, delimiter: string = ','): Promise<T[] | string[][] | {header: string[], data: T[] | string[][]}> {
  // This initial block of code reads from a file in Node.js. The "rl"
  // value can be iterated over in a "for" loop. 
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // handle different line endings
  });
  
  // Create separate arrays to hold the results
  let resultT: T[] = [];
  let resultStrings: string[][] = [];
  let header: string[] | undefined = undefined;
  let lineNumber = 0; // Track actual line number (1-based)
  let rowNumber = 0;  // Track data row number (1-based, excludes header)

  // We add the "await" here because file I/O is asynchronous. 
  // We need to force TypeScript to _wait_ for a row before moving on. 
  // More on this in class soon!
  for await (const line of rl) {
    lineNumber++;
    const values = parseCSVLine(line, delimiter);

    // Handle header row if specified
    if (hasHeaders && lineNumber === 1) {
      header = values;
      continue; // Skip validation for header row
    }
    
    rowNumber++;

    if (schema && schema !== undefined) {
      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        throw new CSVParseError(
          hasHeaders ? lineNumber : rowNumber,
          line,
          parsed.error,
          hasHeaders ? lineNumber - 1 : rowNumber - 1,
          path,
          delimiter
        );
      }
      resultT.push(parsed.data);
    } else {
      resultStrings.push(values);
    }
  }

  // Return the accumulated results if the file is empty or after processing all lines
  if (hasHeaders) {
    // Return wrapped result with header and data
    const data = schema && schema !== undefined ? resultT : resultStrings;
    return { header: header || [], data };
  } else {
    // Return original format for backward compatibility
    if (schema && schema !== undefined) {
      return resultT;
    } else {
      return resultStrings;
    }
  }
}