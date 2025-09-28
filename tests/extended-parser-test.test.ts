import path from "path";
import { z } from "zod";
import { parseCSV, CSVParseError } from "../src/extended-parser";

// Fixtures
const HEADERS_CSV = path.join(__dirname, "../data/extended_headers.csv");
const NO_HEADERS_CSV = path.join(__dirname, "../data/extended_no_headers.csv");
const ERROR_CSV = path.join(__dirname, "../data/extended_error.csv");

// Shared schema for rows: [name, age, city]
const RowSchema = z.tuple([z.string(), z.coerce.number(), z.string()]);

describe("extended parseCSV", () => {
  // --- Has headers ---
  describe("hasHeaders: true", () => {
    test("returns {header, data} without schema", async () => {
      const result = await parseCSV(HEADERS_CSV, { hasHeaders: true });
      expect(result).toEqual({
        header: ["name", "age", "city"],
        data: [
          ["Alice", "23", "New York, NY"],
          ["Bob", "30", "Seattle"],
          ["Charlie, Jr.", "25", "Portland"],
        ],
      });
    });

    test("validates rows with schema and returns typed data", async () => {
      const result = await parseCSV(HEADERS_CSV, { hasHeaders: true, schema: RowSchema });
      // When schema is provided with headers, result is { header, data }
      if (!("header" in (result as any))) throw new Error("Expected header wrapper");
      const wrapper = result as { header: string[]; data: Array<z.infer<typeof RowSchema>> };
      expect(wrapper.header).toEqual(["name", "age", "city"]);
      expect(wrapper.data).toEqual([
        ["Alice", 23, "New York, NY"],
        ["Bob", 30, "Seattle"],
        ["Charlie, Jr.", 25, "Portland"],
      ]);
    });

    test("streaming skips header row and yields parsed rows", async () => {
      const rows: Array<z.infer<typeof RowSchema>> = [];
      for await (const row of parseCSV(HEADERS_CSV, { hasHeaders: true, streaming: true, schema: RowSchema })) {
        rows.push(row as z.infer<typeof RowSchema>);
      }
      expect(rows).toEqual([
        ["Alice", 23, "New York, NY"],
        ["Bob", 30, "Seattle"],
        ["Charlie, Jr.", 25, "Portland"],
      ]);
    });
  });

  // --- No headers ---
  describe("hasHeaders: false (default)", () => {
    test("returns string[][] without schema", async () => {
      const data = await parseCSV(NO_HEADERS_CSV);
      expect(data).toEqual([
        ["Alice", "23", "New York"],
        ["Bob", "30", "Seattle"],
        ["Charlie", "25", "Portland"],
      ]);
    });

    test("validates with schema and returns typed tuples", async () => {
      const rows = (await parseCSV(NO_HEADERS_CSV, { schema: RowSchema })) as Array<z.infer<typeof RowSchema>>;
      expect(rows).toEqual([
        ["Alice", 23, "New York"],
        ["Bob", 30, "Seattle"],
        ["Charlie", 25, "Portland"],
      ]);
    });

    test("streaming yields unwrapped rows with no header", async () => {
      const rows: Array<z.infer<typeof RowSchema>> = [];
      for await (const r of parseCSV(NO_HEADERS_CSV, { streaming: true, schema: RowSchema })) {
        rows.push(r as z.infer<typeof RowSchema>);
      }
      expect(rows).toEqual([
        ["Alice", 23, "New York"],
        ["Bob", 30, "Seattle"],
        ["Charlie", 25, "Portland"],
      ]);
    });
  });

  // --- Error handling ---
  describe("error handling", () => {
    test("batch with headers: throws CSVParseError with row and column info", async () => {
      const badSchema = RowSchema; // age must be number; first row is non-numeric
      await expect(
        parseCSV(ERROR_CSV, { hasHeaders: true, schema: badSchema })
      ).rejects.toThrow(CSVParseError);

      await expect(
        parseCSV(ERROR_CSV, { hasHeaders: true, schema: badSchema })
      ).rejects.toMatchObject({
        rowNumber: 2, // header is line 1; failing data row is line 2
        filePath: ERROR_CSV,
      });
    });

    test("batch without headers: header-like row is data and may pass", async () => {
      // Here, first row is name,age,city which will fail schema because age is not numeric text
      await expect(
        parseCSV(ERROR_CSV, { schema: RowSchema })
      ).rejects.toThrow(CSVParseError);

      await expect(
        parseCSV(ERROR_CSV, { schema: RowSchema })
      ).rejects.toMatchObject({ rowNumber: 1 });
    });

    test("streaming: throws when encountering the first invalid row", async () => {
      const iter = parseCSV(ERROR_CSV, { hasHeaders: true, streaming: true, schema: RowSchema });
      const consume = async () => {
        const rows: Array<z.infer<typeof RowSchema>> = [];
        for await (const r of iter) {
          rows.push(r as z.infer<typeof RowSchema>);
        }
        return rows;
      };
      await expect(consume()).rejects.toThrow(CSVParseError);
    });
  });
});

