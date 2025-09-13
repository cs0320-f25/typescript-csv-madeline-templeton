import * as fs from "fs";
import * as readline from "readline";
import { z } from "zod";

/**
 * This is a JSDoc comment. Similar to JavaDoc, it documents a public-facing
 * function for others to use. Most modern editors will show the comment when 
 * mousing over this function name. Try it in run-parser.ts!
 * 
 * File I/O in TypeScript is "asynchronous", meaning that we can't just
 * read the file and return its contents. You'll learn more about this 
 * in class. For now, just leave the "async" and "await" where they are. 
 * You shouldn't need to alter them.
 * 
 * @param path The path to the file being loaded.
 * @param schema A Zod schema to validate each row against.
 * @returns a "promise" to produce a 2-d array of cell values
 */
export async function parseCSV(path: string): Promise<string[][]> {
  // This initial block of code reads from a file in Node.js. The "rl"
  // value can be iterated over in a "for" loop. 
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // handle different line endings
  });
  
  // Create an empty array to hold the results
  let result = []
  
  // We add the "await" here because file I/O is asynchronous. 
  // We need to force TypeScript to _wait_ for a row before moving on. 
  // More on this in class soon!
  for await (const line of rl) {
    const values = line.split(",").map((v) => v.trim());
    result.push(values)
  }
  return result
}

type ZodType<T> = z.ZodType<T>;

/**
 * 
 * @param path the csv string to parse
 * @param schema the schema to validate against
 * @returns a promise to produce an array of objects of type T if schema is provided, otherwise a 2-d array of strings
 */

export async function parseSchemaCSV<T>(path: string, schema: ZodType<T>): Promise<{ result: T[] | string[][]; errors: { row: number; error: unknown }[] }> {
// This initial block of code reads from a file in Node.js. The "rl"
  // value can be iterated over in a "for" loop. 
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // handle different line endings
  });

  if (schema === undefined) { //fall back to basic pareser if no schema is provided
    return {
      result: await parseCSV(path),
      errors: [{ row: -1, error: "No schema provided, falling back to basic parser" }] //indicate to user that no schema was provided
    };
  } else {

    // Create an empty array to hold the results
  let result : T[] = [];
  let errors: { row: number; error: unknown }[] = [];
  let headers: string[] | null = null;
  let rowNum = 0;
  // We add the "await" here because file I/O is asynchronous. 
  // We need to force TypeScript to _wait_ for a row before moving on. 
  // More on this in class soon!
  for await (const line of rl) {
    const values = line.split(",").map((v) => v.trim()); // Split line into values and trim whitespace
    if (!headers) { //headers will be null for the first line and then assigned the first line of the csv
      headers = values; // First line contains headers
      continue;
    }
    const row: any = {}; // Create an object to hold the row data
  //validate each row against the schema: 
  headers?.forEach((h, i) => {
    row[h] = values[i]; // Map headers to corresponding values
  });
  const parsed = schema.safeParse(row); // Validate the row against the schema
  if (parsed.success) { //note that we need to ensure the "success" property is true and means what we think it means
    result.push(parsed.data); // If valid, add to results
  } else {
    errors.push({ row: rowNum, error: parsed.error }); // If invalid, log the error with the row number
  }
}
  return { result, errors}


}
}  
