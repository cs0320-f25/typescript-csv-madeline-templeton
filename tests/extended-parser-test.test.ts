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


// --- tests for schemas with refine and brand ---
const unrefined_item_schema = z.object({
    itemName: z.string(),
    itemPrice: z.number(),
    itemCategory: z.string(),
});

const item_schema_refined = z.object({
    itemName: z.string().refine(name => name.length > 0, { message: "Item name cannot be empty" }),
    itemPrice: z.number().refine(price => price >= 0, { message: "Item price must be non-negative" }),
    itemCategory: z.string().refine(
        (category) => 
            ['Food', 'Sports', 'Technology', 'Clothes'].includes(category), 
        { message: "Invalid category" }),
});

const restaurant_schema_unbranded = z.object({
    name: z.string(),
    rating: z.number().min(0).max(5),
    cuisine: z.string(),
});

// Define branded field schemas
const RestaurantName = z.string().brand<'valid restaurant name'>();
const Rating = z.number().min(0).max(5).brand<'rating'>();
const Cuisine = z.string().brand<'cuisine'>();

// Combine into an object schema
const restaurant_branded = z.object({
  name: RestaurantName,
  rating: Rating,
  cuisine: Cuisine,
});

// Type inferred with branding applied
type BrandedRestaurant = z.infer<typeof restaurant_branded>;

// === Refinement & Branding integration tests ===

describe("parseCSV with refine() and brand() schemas", () => {
  // Map [itemName, itemPrice, itemCategory] -> object and coerce types
  const RefinedItemRowSchema = z.preprocess((row) => {
    const [itemName, priceStr, itemCategory] = row as string[];
    return { itemName, itemPrice: Number(priceStr), itemCategory };
  }, item_schema_refined);

  // Map [name, rating, cuisine] -> object and coerce types
  const BrandedRestaurantRowSchema = z.preprocess((row) => {
    const [name, ratingStr, cuisine] = row as string[];
    return { name, rating: Number(ratingStr), cuisine } as BrandedRestaurant;
  }, restaurant_branded);

  const ITEMS_REFINED_VALID = path.join(__dirname, "../data/items_refined_valid.csv");
  const ITEMS_REFINED_INVALID = path.join(__dirname, "../data/items_refined_invalid.csv");
  const RESTAURANTS_BRANDED_VALID = path.join(__dirname, "../data/restaurants_branded_valid.csv");
  const RESTAURANTS_BRANDED_INVALID = path.join(__dirname, "../data/restaurants_branded_invalid.csv");

  describe("refine() – items", () => {
    test("valid file parses into refined objects", async () => {
      const result = await parseCSV(ITEMS_REFINED_VALID, { hasHeaders: true, schema: RefinedItemRowSchema });
      if (!("header" in (result as any))) throw new Error("Expected header wrapper");
      const { header, data } = result as { header: string[]; data: Array<z.infer<typeof RefinedItemRowSchema>> };
      expect(header).toEqual(["itemName", "itemPrice", "itemCategory"]);
      expect(data).toEqual([
        { itemName: "Apple", itemPrice: 1.99, itemCategory: "Food" },
        { itemName: "Basketball", itemPrice: 25, itemCategory: "Sports" },
        { itemName: "Laptop", itemPrice: 899.99, itemCategory: "Technology" },
        { itemName: "Jacket", itemPrice: 79.5, itemCategory: "Clothes" },
      ]);
    });

    test("invalid file fails refinement with informative error", async () => {
      await expect(
        parseCSV(ITEMS_REFINED_INVALID, { hasHeaders: true, schema: RefinedItemRowSchema })
      ).rejects.toThrow(CSVParseError);

      await expect(
        parseCSV(ITEMS_REFINED_INVALID, { hasHeaders: true, schema: RefinedItemRowSchema })
      ).rejects.toMatchObject({ rowNumber: 2 }); // first bad row after header
    });
  });

  describe("brand() – restaurants", () => {
    test("valid file parses into branded objects", async () => {
      const result = await parseCSV(RESTAURANTS_BRANDED_VALID, { hasHeaders: true, schema: BrandedRestaurantRowSchema });
      if (!("header" in (result as any))) throw new Error("Expected header wrapper");
      const { header, data } = result as { header: string[]; data: Array<BrandedRestaurant> };
      expect(header).toEqual(["name", "rating", "cuisine"]);
      expect(data).toEqual([
        { name: "Chez Nous", rating: 4.5, cuisine: "French" } as BrandedRestaurant,
        { name: "Green Bowl", rating: 4.0, cuisine: "Vegetarian" } as BrandedRestaurant,
        { name: "Tech Bites", rating: 5, cuisine: "Modern" } as BrandedRestaurant,
      ]);
    });

    test("invalid file fails numeric/brand-related constraints", async () => {
      await expect(
        parseCSV(RESTAURANTS_BRANDED_INVALID, { hasHeaders: true, schema: BrandedRestaurantRowSchema })
      ).rejects.toThrow(CSVParseError);

      // The first offending row may be the one with empty name or non-numeric/out-of-range rating
      await expect(
        parseCSV(RESTAURANTS_BRANDED_INVALID, { hasHeaders: true, schema: BrandedRestaurantRowSchema })
      ).rejects.toMatchObject({ rowNumber: expect.any(Number) });
    });
  });
});


