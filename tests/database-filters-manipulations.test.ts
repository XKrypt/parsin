import fs from 'fs';
import { Parsin } from '../index';
import { DataEvent, DataBox } from '../types/data';


describe("Operations in database.", () => {  
    
    // beforeEach(() => {
    //     new Parsin("database.json", true, 'utf8');
    // });
    
    afterEach(() => {
         fs.rmSync("database.json");
    });
    test("Filter on add data",() => {
        const database = new Parsin("database.json", true, 'utf8',true,true);
        database.addGroup('jest');
        database.addFilter({
            event: DataEvent.OnAddData,
            group : 'jest',
            function : (data:any ):boolean => {
                    if (data == "im fine") {
                        return true
                    }
                    return false
            }
        })

        database.addData("jest","im fine");

        expect(database.getSingleData("jest",data => data.id == 1)?.data).toEqual("im fine");

    });

    test("Filter on edit data",() => {
        const database = new Parsin("database.json", true, 'utf8',true,true);
        database.addGroup("jest");
        database.addFilter({
            event: DataEvent.OnEditData,
            group : 'jest',
            function : (data:any ):boolean => {
                    return data.length > 3
            }
        })

        database.addData("jest","abcd");

        database.editData("jest",1,"abcf");

        expect(database.getSingleData("jest",data => data?.id == 1)?.data).toEqual("abcf");

    })

    test("Manipulate on add data",() => {
        const database = new Parsin("database.json", true, 'utf8',false,true);
        database.addGroup("jest");
        database.addManipulation({
            event: DataEvent.OnAddData,
            group : 'jest',
            function : (data:any ):any => {

                    return data + ", and i need coffe." 
            }
        })

        database.addData("jest","im fine");

        expect(database.getSingleData("jest",data => data?.id == 1)?.data).toEqual("im fine, and i need coffe.");

    })
    test("Manipulate on edit data",() => {
        const database = new Parsin("database.json", true, 'utf8',true,true);
        database.addGroup("jest");
        database.addManipulation({
            event: DataEvent.OnEditData,
            group : 'jest',
            function : (data:any ):any => {

                    return data + ", and i need coffe." 
            }
        })

        database.addData("jest","im fine");
        database.editData("jest",1,"im fine");
        expect(database.getSingleData("jest",data => data?.id == 1)?.data).toEqual("im fine, and i need coffe.");

    })

});