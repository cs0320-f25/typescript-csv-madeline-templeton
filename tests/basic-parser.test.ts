import { parseCSV } from "../src/basic-parser";
import * as path from "path";

const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");

test("parseCSV yields arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  
  expect(results).toHaveLength(5);
  expect(results[0]).toEqual(["name", "age"]);
  expect(results[1]).toEqual(["Alice", "23"]);
  expect(results[2]).toEqual(["Bob", "thirty"]); // why does this work? :(
  expect(results[3]).toEqual(["Charlie", "25"]);
  expect(results[4]).toEqual(["Nim", "22"]);
});

test("parseCSV yields only arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  for(const row of results) {
    expect(Array.isArray(row)).toBe(true);
  }
});

/**
 * Test: Escaped Quotes
 * This test ensures that the parser correctly handles double quotes inside quoted fields,
 * which should be interpreted as a single quote character according to CSV standards.
 */
test("handles escaped quotes inside quoted fields", async () => {
  const file = path.join(__dirname, "../data/escaped_quotes.csv");
  const rows = await parseCSV(file);
  expect(rows[1]).toEqual(['Alice "The Ace"', "23"]);
  expect(rows[2]).toEqual(['Bob "The Builder"', "thirty"]);
  expect(rows[3]).toEqual(['Charlie "Chuck"', "25"]);
  expect(rows[4]).toEqual(['Nim "Nimble"', "22"]);
});

/**
 * Test: Empty Fields at Edges
 * This test checks that the parser correctly interprets empty fields at the start or end of a row,
 * ensuring that missing values are represented as empty strings.
 */
test("handles empty fields at the start or end of a row", async () => {
  const file = path.join(__dirname, "../data/empty_fields_edges.csv");
  const rows = await parseCSV(file);
  expect(rows[1]).toEqual(["", "Alice"]);
  expect(rows[2]).toEqual(["Bob", ""]);
  expect(rows[3]).toEqual(["", "25"]);
  expect(rows[4]).toEqual(["Nim", ""]);
});

/**
 * Test: Blank Lines and Trailing Newlines
 * This test ensures that blank lines in the CSV file are either ignored or handled as specified,
 * and that trailing newlines do not result in extra empty rows.
 */
test("handles blank lines and trailing newlines", async () => {
  const file = path.join(__dirname, "../data/blank_lines.csv");
  const rows = await parseCSV(file);
  expect(rows[0]).toEqual(["name", "age"]);
  expect(rows[1]).toEqual(["Alice", "23"]);
  expect(rows[2]).toEqual(["Bob", "thirty"]);
  expect(rows[3]).toEqual(["Charlie", "25"]);
  expect(rows[4]).toEqual(["Nim", "22"]);
  expect(rows).toHaveLength(5); // Should not include empty rows for blank lines
});

/**
 * Test: Whitespace Handling
 * This test checks that the parser handles whitespace outside of quoted fields correctly,
 * either trimming or preserving it as per the parser's specification.
 */
test("handles whitespace outside of quoted fields", async () => {
  const file = path.join(__dirname, "../data/whitespace.csv");
  const rows = await parseCSV(file);
  // Depending on parser, whitespace may be trimmed or preserved. Adjust expectations accordingly.
  expect(rows[0]).toEqual(["name ", " age"]);
  expect(rows[1]).toEqual([" Alice ", " 23"]);
  expect(rows[2]).toEqual(["Bob ", " thirty "]);
  expect(rows[3]).toEqual([" Charlie ", " 25"]);
  expect(rows[4]).toEqual(["Nim ", " 22"]);
});

/**
 * Test: Mixed Line Endings
 * This test ensures that the parser can handle files with mixed line endings (\n and \r\n),
 * and that all rows are parsed correctly regardless of the line ending style.
 */
test("handles mixed line endings", async () => {
  const file = path.join(__dirname, "../data/mixed_line_endings.csv");
  const rows = await parseCSV(file);
  expect(rows[0]).toEqual(["name", "age"]);
  expect(rows[1]).toEqual(["Alice", "23"]);
  expect(rows[2]).toEqual(["Bob", "thirty"]);
  expect(rows[3]).toEqual(["Charlie", "25"]);
  expect(rows[4]).toEqual(["Nim", "22"]);
});

/**
 * Test: Malformed Input (Unclosed Quotes)
 * This test checks that the parser either throws an error or handles the case gracefully
 * when encountering malformed CSV input, such as an unclosed quoted field.
 */
test("handles malformed input with unclosed quotes", async () => {
  const file = path.join(__dirname, "../data/malformed.csv");
  await expect(parseCSV(file)).rejects.toThrow();
});

/**
 * Test: Empty File
 * This test ensures that the parser correctly handles an empty file,
 * returning an empty array or the appropriate representation.
 */
test("handles empty file", async () => {
  const file = path.join(__dirname, "../data/empty.csv");
  const rows = await parseCSV(file);
  expect(rows).toEqual([]);
});

/**
 * Test: Embedded Delimiters and Quotes in Various Columns
 * This test ensures that the parser correctly handles fields with embedded commas and quotes,
 * especially when these appear in different columns.
 */
test("handles embedded delimiters and quotes in various columns", async () => {
  const file = path.join(__dirname, "../data/embedded_delimiters_quotes.csv");
  const rows = await parseCSV(file);
  expect(rows[1]).toEqual(["1", "Alice, A.", "23", 'Loves "coding", enjoys pizza']);
  expect(rows[2]).toEqual(["2", "Bob", "thirty", 'Favorite city: "San Francisco, CA"']);
  expect(rows[3]).toEqual(["3", "Charlie", "25", 'He said, "Hello!"']);
  expect(rows[4]).toEqual(["4", "Nim", "22", "No notes"]);
});