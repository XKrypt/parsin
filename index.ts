import * as fs from 'fs';

import {
    DataBase,
    DataBox,
    DataGroup,
    Filter,
    DataEvent,
    FilterDataFunction,
    DataManipulator,
    Manipulation
} from './types/data';

export class Parsin {
    filePath: string
    loadDataInMemory: boolean
    useDataFilters : boolean
    useDataManipulation : boolean
    manipulations : Manipulation[] = []
    filters : Filter[] = []
    encoding: BufferEncoding = 'utf8'
    data: DataBase = {
        groups: []
    }

    /**
     * Initialize for create or consume a database.
     * @param filePath Put file path for consume or create file
     * @param loadDataInMemory Load all data in the memory
     * @param encoding Encoding type
     */
    constructor(filePath: string, loadDataInMemory: boolean = false, encoding: BufferEncoding = 'utf-8', useDataFilters:boolean = false, useDataManipulation = false) {
        this.filePath = filePath;
        this.loadDataInMemory = loadDataInMemory;
        this.encoding = encoding;
        this.useDataManipulation = useDataManipulation
        this.useDataFilters = useDataFilters
        this.initialize();

        if (loadDataInMemory) {
            this.loadInMemory(encoding);
        }
    }

    /**
     * If the file doesn't exist, create the file.
     */
    private initialize() {
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify(
                {
                    groups: []
                }
            ))
        }
    }

    private loadInMemory(fileEncode: BufferEncoding = 'utf-8'): void {
        this.data = this.loadFileData(fileEncode);
    }


    /**
     * Load from file
     * @param fileEncode Choose file encoding (default: `UTF-8`)
     * @returns `DataBase`
     */
    private loadFileData(fileEncode: BufferEncoding = 'utf-8'): DataBase {
        return JSON.parse(fs.readFileSync(this.filePath, { encoding: 'utf8', flag: 'r' }));
    }


    private saveData(data: DataBase): void {
        let dataJson: string = JSON.stringify(data);

        fs.writeFileSync(this.filePath, dataJson);


        this.reloadDataFromFile();
    }

    /**
     * Get single data from a group
     * @param groupKey 
     * @param dataPredicate 
     * @returns `DataBox | undefined`
     */
    getSingleData(groupKey: string, dataPredicate: (value: DataBox) => unknown): DataBox | undefined {

        //Load data
        let data: DataBase = this.getDataBase();
        //Find group
        let groups: DataGroup | undefined = data.groups.find(x => x.key == groupKey) ||
            { key: "", idCount: 0, data: [] };

            if (groups.key == "") {
                return undefined;
            }

        //Find data in the group
        for (let index = 0; index < groups.data.length; index++) {
            const dataBox: DataBox = groups.data[index];
            if (dataPredicate(dataBox)) {
                return dataBox;
            }
        }

        return undefined;
    }

    /**
     * Reload data from file, Warning : only work if loadInMemory is true
     */
    reloadDataFromFile(): void {
        if (this.loadDataInMemory) {
            this.loadInMemory(this.encoding);
        }
    }

    /**
     * Add data filter
     * @param filter 
     * @returns `void`
     */
    addFilter(filter:Filter):void{
        this.filters.push(filter);
    }



    /**
     * Add data manipulator
     * @param manipulation 
     * @returns `void`
     */
    addManipulation(manipulation:Manipulation):void{
        this.manipulations.push(manipulation);
    }

    private getDataBase(): DataBase {
        let data: DataBase = this.loadDataInMemory ? this.data : this.loadFileData();

        return data;
    }

    /**
     * Get a group
     * @param key 
     * @returns `DataGroup | undefined`
     */
    getGroup(key: string): DataGroup | undefined {
        let data: DataBase = this.getDataBase();

        return data.groups.find(x => x.key == key);
    }

    /**
     * Get a multiple groups
     * @param groupPredicate 
     * @returns `DataGroup[] | undefined`
     */
    getMultipleGroups(groupPredicate: (value: DataGroup, key: number) => unknown): DataGroup[] | undefined {
        let data: DataBase = this.getDataBase();

        return data.groups.filter(groupPredicate) || [];
    }

    /**
     * Add new group
     * @param key 
     * @param startCount 
     */
    addGroup(key: string, startCount: number = 0): void {
        let data: DataBase = this.getDataBase();

        let newGroup: DataGroup = {
            key: key,
            idCount: startCount,
            data: []
        }


        data.groups.push(newGroup);

        this.saveData(data);
    }

    /**
     * Add a data to a group
     * @param groupKey 
     * @param value
     */
    addData(groupKey: string, value: any): void {

        let dataBase: DataBase = this.getDataBase();


        //Find group
        let group: DataGroup | undefined = dataBase.groups.find(x => x.key == groupKey)
            || { key: "", idCount: 0, data: [] };

        //increase counting to be used in id
        group.idCount++;

        if (this.useDataManipulation && this.manipulations.filter(manipulation => manipulation.group == groupKey).length > 0) {
            value = this.manipulations.find(x => x.event == DataEvent.OnAddData && x.group == groupKey)?.function(value)
        }
        
        if (this.useDataFilters && this.filters.filter(filter => filter.group == groupKey).length > 0) {


            for (let index = 0; index < this.filters.length; index++) {
                const filter = this.filters[index];
                if (filter.event == DataEvent.OnAddData && filter.group == groupKey) {
                    if (!filter.function(value)) {
                        return
                    }
                }
                
            }
            group.data.push({
                data: value,
                id: group.idCount
            });
            return
        }

        group.data.push({
            data: value,
            id: group.idCount
        });

        this.replaceGroup(groupKey,group);

        
    }

    /**
     * Replace a group
     * @param groupKey 
     * @param group 
     */
    replaceGroup(groupKey: string, group: DataGroup): void {
        let dataBase: DataBase = this.getDataBase();

        dataBase.groups = dataBase.groups.filter((value, key) => {
            return value.key != groupKey;
        })

        dataBase.groups.push(group);
        this.saveData(dataBase);
    }

    /**
     * Remove a group
     * @param predicate 
     */
    removeGroup(predicate: (value: DataGroup) => unknown): void {

        let data: DataBase = this.getDataBase();

        data.groups = data.groups.filter((value, index) => {
            return !predicate(value);
        });

        this.saveData(data);
    }

    /**
     * Edit a data from a group
     * @param groupKey 
     * @param dataId 
     * @param newData 
     */
    editData(groupKey: string, dataId: number, newData: any): void {

        let group: DataGroup | undefined = this.getGroup(groupKey) || { key: "", idCount: 0, data: [] };
        
        if (this.useDataManipulation &&  this.manipulations.filter(manipulation => manipulation.group == groupKey).length > 0) {
            newData = this.manipulations.find(x => x.event == DataEvent.OnEditData && x.group == groupKey)?.function(newData)
        }
        
        if (this.useDataFilters &&  this.filters.filter(filter => filter.group == groupKey).length > 0) {


            for (let index = 0; index < this.filters.length; index++) {
                const filter = this.filters[index];
                if (filter.event == DataEvent.OnEditData && filter.group == groupKey) {
                    if (!filter.function(newData)) {
                        return
                    }
                }
                
            }
        }

        for (let index = 0; index < group?.data.length; index++) {
            if (group.data[index].id == dataId) {
                group.data[index].data = newData;
                this.replaceGroup(groupKey, group);
            }

        }
    }

    /**
     * Get a multiples datas
     * @param groupKey 
     * @param dataPredicate 
     * @returns `DataBox[] | undefined`
     */
    getMultipleData(groupKey: string, dataPredicate: (value: DataBox, key: number) => unknown): DataBox[] | undefined {
        let data: DataBase = this.getDataBase();
        return data.groups.find(group => group.key == groupKey)?.data.filter(dataPredicate) || [];
    }

    /**
     * Get all data from a group
     * @param groupKey 
     * @returns `any[] | undefined`
     */
    getAllData(groupKey: string): any[] | undefined {
        let data: DataBase = this.getDataBase();
        return data.groups.find(group => group.key == groupKey)?.data;
    }

    /**
     * Remove a data from a group
     * @param groupKey 
     * @param dataPredicate 
     */
    removeData(groupKey: string, dataPredicate: (value: DataBox) => unknown): void {

        //Load data
        let data: DataBase = this.getDataBase();
        //Find group
        let group: DataGroup | undefined = data.groups.find(x => x.key == groupKey)
            || { key: "", idCount: 0, data: [] };

        group.data = group.data.filter((value, key) => {
            return !dataPredicate(value);
        })

        this.replaceGroup(group.key, group);
    }

}

export default Parsin;