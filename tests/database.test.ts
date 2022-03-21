
import fs from 'fs';
import Parsim from '..';

test("Expected to create a file", () => {
    const database = new Parsim("database.json",true,'utf8');

    expect(fs.existsSync("database.json")).toEqual(true);
})

describe("Operations in database.", () => {
    const database = new Parsim("database.json",true,'utf8');

    test("Add new group", () => {
        database.addGroup("jest");
        expect(database.getGroup("jest")?.key).toEqual("jest");
    })

    test("Add new data", () => {
        database.addData("jest",{
            id : 0,
            jest : "Hi! i am jest!"
        });

        expect(database.getData('jest',(data:any) => data.id == 0).id).toEqual(0);
    })


    test("Replace Group", () => {
        database.replaceGroup("jest",{
            key : 'guest',
            data : [{
                id : 1,
                guest : 'i am guest now'
            }],
            isCounting : false,
            idCount : 0
        })

        expect(database.getGroup("guest")?.key).toEqual("guest");
    })

    test("Delete data", () => {
        database.removeData("guest", value => value.id == 1);

        expect(database.getData("guest", data => data.id == 1) ).toEqual(undefined);
    })
    test("Delete group", () => {
        database.removeGroup("guest");

        expect(database.getGroup("guest")).toEqual(undefined);
    })

    test("Filter group", () => {
        database.addGroup("jest");
        database.filterGroup(group => group.key != "jest");

        expect(database.getGroup("jest")).toEqual(undefined);

    
    });
})