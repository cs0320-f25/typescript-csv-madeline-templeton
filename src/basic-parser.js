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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCSV = parseCSV;
exports.parseSchemaCSV = parseSchemaCSV;
var fs = require("fs");
var readline = require("readline");
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
function parseCSV(path) {
    return __awaiter(this, void 0, void 0, function () {
        var fileStream, rl, result, _a, rl_1, rl_1_1, line, values, e_1_1;
        var _b, e_1, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    fileStream = fs.createReadStream(path);
                    rl = readline.createInterface({
                        input: fileStream,
                        crlfDelay: Infinity, // handle different line endings
                    });
                    result = [];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 12]);
                    _a = true, rl_1 = __asyncValues(rl);
                    _e.label = 2;
                case 2: return [4 /*yield*/, rl_1.next()];
                case 3:
                    if (!(rl_1_1 = _e.sent(), _b = rl_1_1.done, !_b)) return [3 /*break*/, 5];
                    _d = rl_1_1.value;
                    _a = false;
                    line = _d;
                    values = line.split(",").map(function (v) { return v.trim(); });
                    result.push(values);
                    _e.label = 4;
                case 4:
                    _a = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _e.trys.push([7, , 10, 11]);
                    if (!(!_a && !_b && (_c = rl_1.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _c.call(rl_1)];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, result];
            }
        });
    });
}
/**
 *
 * @param path the csv string to parse
 * @param schema the schema to validate against
 * @returns a promise to produce an array of objects of type T if schema is provided, otherwise a 2-d array of strings
 */
function parseSchemaCSV(path, schema) {
    return __awaiter(this, void 0, void 0, function () {
        var fileStream, rl, result, errors, headers, rowNum, _loop_1, _a, rl_2, rl_2_1, e_2_1;
        var _b;
        var _c, e_2, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    fileStream = fs.createReadStream(path);
                    rl = readline.createInterface({
                        input: fileStream,
                        crlfDelay: Infinity, // handle different line endings
                    });
                    if (!(schema === undefined)) return [3 /*break*/, 2];
                    _b = {};
                    return [4 /*yield*/, parseCSV(path)];
                case 1: //fall back to basic pareser if no schema is provided
                return [2 /*return*/, (_b.result = _f.sent(),
                        _b.errors = [{ row: -1, error: "No schema provided, falling back to basic parser" }] //indicate to user that no schema was provided
                    ,
                        _b)];
                case 2:
                    result = [];
                    errors = [];
                    headers = null;
                    rowNum = 0;
                    _f.label = 3;
                case 3:
                    _f.trys.push([3, 8, 9, 14]);
                    _loop_1 = function () {
                        _e = rl_2_1.value;
                        _a = false;
                        var line = _e;
                        var values = line.split(",").map(function (v) { return v.trim(); }); // Split line into values and trim whitespace
                        if (!headers) { //headers will be null for the first line and then assigned the first line of the csv
                            headers = values; // First line contains headers
                            return "continue";
                        }
                        var row = {}; // Create an object to hold the row data
                        //validate each row against the schema: 
                        headers === null || headers === void 0 ? void 0 : headers.forEach(function (h, i) {
                            row[h] = values[i]; // Map headers to corresponding values
                        });
                        var parsed = schema.safeParse(row); // Validate the row against the schema
                        if (parsed.success) { //note that we need to ensure the "success" property is true and means what we think it means
                            result.push(parsed.data); // If valid, add to results
                        }
                        else {
                            errors.push({ row: rowNum, error: parsed.error }); // If invalid, log the error with the row number
                        }
                    };
                    _a = true, rl_2 = __asyncValues(rl);
                    _f.label = 4;
                case 4: return [4 /*yield*/, rl_2.next()];
                case 5:
                    if (!(rl_2_1 = _f.sent(), _c = rl_2_1.done, !_c)) return [3 /*break*/, 7];
                    _loop_1();
                    _f.label = 6;
                case 6:
                    _a = true;
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_2_1 = _f.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _f.trys.push([9, , 12, 13]);
                    if (!(!_a && !_c && (_d = rl_2.return))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _d.call(rl_2)];
                case 10:
                    _f.sent();
                    _f.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14: return [2 /*return*/, { result: result, errors: errors }];
            }
        });
    });
}
