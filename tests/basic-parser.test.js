"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var basic_parser_1 = require("../src/basic-parser");
var path = require("path");
var PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");
test("parseCSV yields arrays", function () { return __awaiter(void 0, void 0, void 0, function () {
    var results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, basic_parser_1.parseCSV)(PEOPLE_CSV_PATH)];
            case 1:
                results = _a.sent();
                expect(results).toHaveLength(5);
                expect(results[0]).toEqual(["name", "age"]);
                expect(results[1]).toEqual(["Alice", "23"]);
                expect(results[2]).toEqual(["Bob", "thirty"]); // why does this work? :(
                expect(results[3]).toEqual(["Charlie", "25"]);
                expect(results[4]).toEqual(["Nim", "22"]);
                return [2 /*return*/];
        }
    });
}); });
test("parseCSV yields only arrays", function () { return __awaiter(void 0, void 0, void 0, function () {
    var results, _i, results_1, row;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, basic_parser_1.parseCSV)(PEOPLE_CSV_PATH)];
            case 1:
                results = _a.sent();
                for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                    row = results_1[_i];
                    expect(Array.isArray(row)).toBe(true);
                }
                return [2 /*return*/];
        }
    });
}); });
/**
 * Test: Escaped Quotes
 * This test ensures that the parser correctly handles double quotes inside quoted fields,
 * which should be interpreted as a single quote character according to CSV standards.
 */
test("handles escaped quotes inside quoted fields", function () { return __awaiter(void 0, void 0, void 0, function () {
    var file, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                file = path.join(__dirname, "../data/escaped_quotes.csv");
                return [4 /*yield*/, (0, basic_parser_1.parseCSV)(file)];
            case 1:
                rows = _a.sent();
                expect(rows[1]).toEqual(['Alice "The Ace"', "23"]);
                expect(rows[2]).toEqual(['Bob "The Builder"', "thirty"]);
                expect(rows[3]).toEqual(['Charlie "Chuck"', "25"]);
                expect(rows[4]).toEqual(['Nim "Nimble"', "22"]);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Test: Empty Fields at Edges
 * This test checks that the parser correctly interprets empty fields at the start or end of a row,
 * ensuring that missing values are represented as empty strings.
 */
test("handles empty fields at the start or end of a row", function () { return __awaiter(void 0, void 0, void 0, function () {
    var file, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                file = path.join(__dirname, "../data/empty_fields_edges.csv");
                return [4 /*yield*/, (0, basic_parser_1.parseCSV)(file)];
            case 1:
                rows = _a.sent();
                expect(rows[1]).toEqual(["", "Alice"]);
                expect(rows[2]).toEqual(["Bob", ""]);
                expect(rows[3]).toEqual(["", "25"]);
                expect(rows[4]).toEqual(["Nim", ""]);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Test: Blank Lines and Trailing Newlines
 * This test ensures that blank lines in the CSV file are either ignored or handled as specified,
 * and that trailing newlines do not result in extra empty rows.
 */
test("handles blank lines and trailing newlines", function () { return __awaiter(void 0, void 0, void 0, function () {
    var file, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                file = path.join(__dirname, "../data/blank_lines.csv");
                return [4 /*yield*/, (0, basic_parser_1.parseCSV)(file)];
            case 1:
                rows = _a.sent();
                expect(rows[0]).toEqual(["name", "age"]);
                expect(rows[1]).toEqual(["Alice", "23"]);
                expect(rows[2]).toEqual(["Bob", "thirty"]);
                expect(rows[3]).toEqual(["Charlie", "25"]);
                expect(rows[4]).toEqual(["Nim", "22"]);
                expect(rows).toHaveLength(5); // Should not include empty rows for blank lines
                return [2 /*return*/];
        }
    });
}); });
/**
 * Test: Whitespace Handling
 * This test checks that the parser handles whitespace outside of quoted fields correctly,
 * either trimming or preserving it as per the parser's specification.
 */
test("handles whitespace outside of quoted fields", function () { return __awaiter(void 0, void 0, void 0, function () {
    var file, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                file = path.join(__dirname, "../data/whitespace.csv");
                return [4 /*yield*/, (0, basic_parser_1.parseCSV)(file)];
            case 1:
                rows = _a.sent();
                // Depending on parser, whitespace may be trimmed or preserved. Adjust expectations accordingly.
                expect(rows[0]).toEqual(["name ", " age"]);
                expect(rows[1]).toEqual([" Alice ", " 23"]);
                expect(rows[2]).toEqual(["Bob ", " thirty "]);
                expect(rows[3]).toEqual([" Charlie ", " 25"]);
                expect(rows[4]).toEqual(["Nim ", " 22"]);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Test: Mixed Line Endings
 * This test ensures that the parser can handle files with mixed line endings (\n and \r\n),
 * and that all rows are parsed correctly regardless of the line ending style.
 */
test("handles mixed line endings", function () { return __awaiter(void 0, void 0, void 0, function () {
    var file, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                file = path.join(__dirname, "../data/mixed_line_endings.csv");
                return [4 /*yield*/, (0, basic_parser_1.parseCSV)(file)];
            case 1:
                rows = _a.sent();
                expect(rows[0]).toEqual(["name", "age"]);
                expect(rows[1]).toEqual(["Alice", "23"]);
                expect(rows[2]).toEqual(["Bob", "thirty"]);
                expect(rows[3]).toEqual(["Charlie", "25"]);
                expect(rows[4]).toEqual(["Nim", "22"]);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Test: Malformed Input (Unclosed Quotes)
 * This test checks that the parser either throws an error or handles the case gracefully
 * when encountering malformed CSV input, such as an unclosed quoted field.
 */
test("handles malformed input with unclosed quotes", function () { return __awaiter(void 0, void 0, void 0, function () {
    var file;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                file = path.join(__dirname, "../data/malformed.csv");
                return [4 /*yield*/, expect((0, basic_parser_1.parseCSV)(file)).rejects.toThrow()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Test: Empty File
 * This test ensures that the parser correctly handles an empty file,
 * returning an empty array or the appropriate representation.
 */
test("handles empty file", function () { return __awaiter(void 0, void 0, void 0, function () {
    var file, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                file = path.join(__dirname, "../data/empty.csv");
                return [4 /*yield*/, (0, basic_parser_1.parseCSV)(file)];
            case 1:
                rows = _a.sent();
                expect(rows).toEqual([]);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Test: Embedded Delimiters and Quotes in Various Columns
 * This test ensures that the parser correctly handles fields with embedded commas and quotes,
 * especially when these appear in different columns.
 */
test("handles embedded delimiters and quotes in various columns", function () { return __awaiter(void 0, void 0, void 0, function () {
    var file, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                file = path.join(__dirname, "../data/embedded_delimiters_quotes.csv");
                return [4 /*yield*/, (0, basic_parser_1.parseCSV)(file)];
            case 1:
                rows = _a.sent();
                expect(rows[1]).toEqual(["1", "Alice, A.", "23", 'Loves "coding", enjoys pizza']);
                expect(rows[2]).toEqual(["2", "Bob", "thirty", 'Favorite city: "San Francisco, CA"']);
                expect(rows[3]).toEqual(["3", "Charlie", "25", 'He said, "Hello!"']);
                expect(rows[4]).toEqual(["4", "Nim", "22", "No notes"]);
                return [2 /*return*/];
        }
    });
}); });
