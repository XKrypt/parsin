"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const __1 = __importDefault(require(".."));
test("Expected to create a file", () => {
    const database = new __1.default("database.json", true, 'utf8');
    expect(fs_1.default.existsSync("database.json")).toEqual(true);
});
describe("Operations in database.", () => {
    const database = new __1.default("database.json", true, 'utf8');
    test("Add new group", () => {
        var _a;
        database.addGroup("jest");
        expect((_a = database.getGroup("jest")) === null || _a === void 0 ? void 0 : _a.key).toEqual("jest");
    });
    test("Add new data", () => {
        database.addData("jest", {
            id: 0,
            jest: "Hi! i am jest!"
        });
        expect(database.getData('jest', (data) => data.id == 0).id).toEqual(0);
    });
    test("Replace Group", () => {
        var _a;
        database.replaceGroup("jest", {
            key: 'guest',
            data: [{
                    id: 1,
                    guest: 'i am guest now'
                }],
            isCounting: false,
            idCount: 0
        });
        expect((_a = database.getGroup("guest")) === null || _a === void 0 ? void 0 : _a.key).toEqual("guest");
    });
    test("Delete data", () => {
        database.removeData("guest", value => value.id == 1);
        expect(database.getData("guest", data => data.id == 1)).toEqual(undefined);
    });
    test("Delete group", () => {
        database.removeGroup("guest");
        expect(database.getGroup("guest")).toEqual(undefined);
    });
    test("Filter group", () => {
        database.addGroup("jest");
        database.filterGroup(group => group.key != "jest");
        expect(database.getGroup("jest")).toEqual(undefined);
    });
});
