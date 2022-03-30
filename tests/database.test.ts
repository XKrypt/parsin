import fs from 'fs';
import { Parsin } from '..';

describe("Manipulate the file", () => {
    test("Expected to create a file", () => {
        new Parsin("database.json", true, 'utf8');
        expect(fs.existsSync("database.json")).toEqual(true);
    })
})

describe("Operations in database.", () => {    
    beforeEach(() => {
        new Parsin("database.json", true, 'utf8');
    });
    
    afterEach(() => {
        fs.rmSync("database.json");
    });

    const database = new Parsin("database.json", true, 'utf8');

    test("Add new group", () => {
        database.addGroup("jest");
        expect(database.getGroup("jest")?.key).toEqual("jest");
    })
    test("Get multiple groups", () => {
        database.addGroup("hello");
        expect(database.getMultipleGroups(group => group.key != "")?.length).toEqual(2);
    })

    test("Add new data", () => {
        database.addData("jest", {
            jest: "Hi! i am jest!"
        });

        expect(database.getSingleData('jest', (data) => data.id == 1)?.data.jest).toEqual("Hi! i am jest!");
    })
    test("Edit data", () => {
        database.editData("jest", 1, {
            fast: "I am fast now!!"
        });
        expect(database.getSingleData('jest', (data) => data.id == 1)?.data.fast).toEqual("I am fast now!!");
    })
    test("Get multiple data", () => {
        database.addData("jest", {
            jest: "Hi! i am jest!"
        });

        expect(database.getMultipleData('jest', (data) => data.id >= 1)?.length).toEqual(2);
    })
    test("Get all data", () => {
        expect(database.getAllData('jest')?.length).toEqual(2);
    })

    test("Replace Group", () => {
        database.replaceGroup("jest", {
            key: 'guest',
            data: [
                {
                    data: "im am guest now",
                    id: 0
                }
            ],
            idCount: 0
        })

        expect(database.getGroup("guest")?.key).toEqual("guest");
    })

    test("Delete data", () => {
        database.removeData("guest", value => value.id == 0);

        expect(database.getSingleData("guest", data => data.id == 1)).toEqual(undefined);
    })
    test("Delete group", () => {
        database.removeGroup((value) => value.key == "guest");

        expect(database.getGroup("guest")).toEqual(undefined);
    });
})