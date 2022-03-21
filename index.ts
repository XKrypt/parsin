import * as fs from 'fs';

class Parsim {
    filePath: string
    loadDataInMemory: boolean
    encondig: BufferEncoding = 'utf8'
    data: DataBase = {
        groups: []
    }

    constructor(filePath: string, loadDataInMemory: boolean = false, encoding: BufferEncoding = 'utf-8') {
        this.filePath = filePath;
        this.loadDataInMemory = loadDataInMemory;
        this.encondig = encoding;
        this.initialize();

        if (loadDataInMemory) {
            this.loadInMemory(encoding);
        }
    }

    private initialize(){
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath,JSON.stringify(
                {
                    groups: []
                }
            ))
        }
    }

    private loadInMemory(fileEncode: BufferEncoding = 'utf-8'): void {
        this.data = this.loadFileData(fileEncode);
    }

    //Load from file
    private loadFileData(fileEncode: BufferEncoding = 'utf-8'): DataBase {
        return JSON.parse(fs.readFileSync(this.filePath, { encoding: 'utf8', flag: 'r' }));
    }


    private saveData(data: DataBase): void {
        let dataJson:string = JSON.stringify(data);

        fs.writeFileSync(this.filePath,dataJson);
    }


    //Get single data from a group
    getData(groupKey: string, dataPredicate:  (value: any) => unknown): any {

        //Load data
        let data: DataBase = this.getDataBase();
        //Find group
        let groups: DataGroup | undefined = data.groups.find(x => x.key == groupKey)
            || { key: "", idCount: 0, data: [], isCounting: false };


        //Loop trough group and find data 
        for (let index = 0; index < groups?.data.length; index++) {
            const data:DataGroup[] = groups?.data[index];
            if (dataPredicate(data)) {
                return data;
            }
        }
    }

    //Reload data from file, Warning : only work if loadInMemory is true
    reloadDataFromFile():void{
        if (this.loadDataInMemory) {
            this.loadInMemory(this.encondig);
        }
    }

    private getDataBase(): DataBase {
        let data: DataBase = this.loadDataInMemory ? this.data : this.loadFileData();

        return data;
    }

    //Get group
    getGroup(key: string): DataGroup | undefined {
        let data: DataBase = this.getDataBase();

        return data.groups.find(x => x.key == key);
    }

    //Add new group
    addGroup(key: string, options: GroupOptions = { idCount: 0, isCounting: false, }): void {
        let data: DataBase = this.getDataBase();

        let newGroup: DataGroup = {
            key: key,
            idCount: options?.idCount || 0,
            isCounting: options?.isCounting || false,
            data: []
        }


        data.groups.push(newGroup);

        this.saveData(data);
    }


    //Add data to a group
    addData(groupKey: string, value: any): void {

        let dataBase: DataBase = this.getDataBase();


        //Find group
        let group: DataGroup | undefined = dataBase.groups.find(x => x.key == groupKey)
            || { key: "", idCount: 0, data: [], isCounting: false };

        group.data.push(value);

        for (let index = 0; index < dataBase.groups.length; index++) {
            if (this.data.groups[index].key == group.key) {
                dataBase.groups[index] = group;
            }
        }

        this.saveData(dataBase);
    }


    //Replace a group
    replaceGroup(groupKey: string, group: DataGroup): void {
        let dataBase: DataBase = this.getDataBase();

        dataBase.groups = dataBase.groups.filter((value,key) => {
            return value.key != groupKey;
        })

        dataBase.groups.push(group);
        this.saveData(dataBase);
    }


    //Removes a group
    filterGroup(predicate: (value: DataGroup, index: number, array: DataGroup[]) => unknown): void {

        let data: DataBase = this.getDataBase();

        data.groups = data.groups.filter(predicate);

        this.saveData(data);
    }

    removeGroup(groupKey:string): void {

        let data: DataBase = this.getDataBase();

        data.groups = data.groups.filter(value => value.key != groupKey);

        this.saveData(data);
    }


    //Remove data
    removeData(groupKey: string, dataPredicate: (value: any, key: number) => unknown): void {

        //Load data
        let data: DataBase = this.getDataBase();
        //Find group
        let group: DataGroup | undefined = data.groups.find(x => x.key == groupKey)
            || { key: "", idCount: 0, data: [], isCounting: false };

        group.data = group.data.filter((value, key) => {
            return !dataPredicate(value, key);
        })

        this.replaceGroup(group.key, group);
    }

}

interface DataBase {
    groups: DataGroup[]
}

type GroupOptions = {
    idCount: number,
    isCounting: boolean,
}

type DataGroup = {
    key: string
    idCount: number,
    isCounting: boolean,
    data: any[]
}

export default Parsim;