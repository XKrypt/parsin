"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parsin = void 0;
const fs = __importStar(require("fs"));
const data_1 = require("./types/data");
class Parsin {
    /**
     * Initialize for create or consume a database.
     * @param filePath Put file path for consume or create file
     * @param loadDataInMemory Load all data in the memory
     * @param encoding Encoding type
     */
    constructor(filePath, loadDataInMemory = false, encoding = 'utf-8', useDataFilters = false, useDataManipulation = false) {
        this.manipulations = [];
        this.filters = [];
        this.encoding = 'utf8';
        this.data = {
            groups: []
        };
        this.filePath = filePath;
        this.loadDataInMemory = loadDataInMemory;
        this.encoding = encoding;
        this.useDataManipulation = useDataManipulation;
        this.useDataFilters = useDataFilters;
        this.initialize();
        if (loadDataInMemory) {
            this.loadInMemory(encoding);
        }
    }
    /**
     * If the file doesn't exist, create the file.
     */
    initialize() {
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify({
                groups: []
            }));
        }
    }
    loadInMemory(fileEncode = 'utf-8') {
        this.data = this.loadFileData(fileEncode);
    }
    /**
     * Load from file
     * @param fileEncode Choose file encoding (default: `UTF-8`)
     * @returns `DataBase`
     */
    loadFileData(fileEncode = 'utf-8') {
        return JSON.parse(fs.readFileSync(this.filePath, { encoding: 'utf8', flag: 'r' }));
    }
    saveData(data) {
        let dataJson = JSON.stringify(data);
        fs.writeFileSync(this.filePath, dataJson);
        this.reloadDataFromFile();
    }
    /**
     * Get single data from a group
     * @param groupKey
     * @param dataPredicate
     * @returns `DataBox | undefined`
     */
    getSingleData(groupKey, dataPredicate) {
        //Load data
        let data = this.getDataBase();
        //Find group
        let groups = data.groups.find(x => x.key == groupKey) ||
            { key: "", idCount: 0, data: [] };
        if (groups.key == "") {
            return undefined;
        }
        //Find data in the group
        for (let index = 0; index < groups.data.length; index++) {
            const dataBox = groups.data[index];
            if (dataPredicate(dataBox)) {
                return dataBox;
            }
        }
        return undefined;
    }
    /**
     * Reload data from file, Warning : only work if loadInMemory is true
     */
    reloadDataFromFile() {
        if (this.loadDataInMemory) {
            this.loadInMemory(this.encoding);
        }
    }
    /**
     * Add data filter
     * @param filter
     * @returns `void`
     */
    addFilter(filter) {
        this.filters.push(filter);
    }
    /**
     * Add data manipulator
     * @param manipulation
     * @returns `void`
     */
    addManipulation(manipulation) {
        this.manipulations.push(manipulation);
    }
    getDataBase() {
        let data = this.loadDataInMemory ? this.data : this.loadFileData();
        return data;
    }
    /**
     * Get a group
     * @param key
     * @returns `DataGroup | undefined`
     */
    getGroup(key) {
        let data = this.getDataBase();
        return data.groups.find(x => x.key == key);
    }
    /**
     * Get a multiple groups
     * @param groupPredicate
     * @returns `DataGroup[] | undefined`
     */
    getMultipleGroups(groupPredicate) {
        let data = this.getDataBase();
        return data.groups.filter(groupPredicate) || [];
    }
    /**
     * Add new group
     * @param key
     * @param startCount
     */
    addGroup(key, startCount = 0) {
        let data = this.getDataBase();
        let newGroup = {
            key: key,
            idCount: startCount,
            data: []
        };
        data.groups.push(newGroup);
        this.saveData(data);
    }
    /**
     * Add a data to a group
     * @param groupKey
     * @param value
     */
    addData(groupKey, value) {
        var _a;
        let dataBase = this.getDataBase();
        //Find group
        let group = dataBase.groups.find(x => x.key == groupKey)
            || { key: "", idCount: 0, data: [] };
        //increase counting to be used in id
        group.idCount++;
        if (this.useDataManipulation && this.manipulations.filter(manipulation => manipulation.group == groupKey).length > 0) {
            value = (_a = this.manipulations.find(x => x.event == data_1.DataEvent.OnAddData && x.group == groupKey)) === null || _a === void 0 ? void 0 : _a.function(value);
        }
        if (this.useDataFilters && this.filters.filter(filter => filter.group == groupKey).length > 0) {
            for (let index = 0; index < this.filters.length; index++) {
                const filter = this.filters[index];
                if (filter.event == data_1.DataEvent.OnAddData && filter.group == groupKey) {
                    if (!filter.function(value)) {
                        return;
                    }
                }
            }
            group.data.push({
                data: value,
                id: group.idCount
            });
            return;
        }
        group.data.push({
            data: value,
            id: group.idCount
        });
        this.replaceGroup(groupKey, group);
    }
    /**
     * Replace a group
     * @param groupKey
     * @param group
     */
    replaceGroup(groupKey, group) {
        let dataBase = this.getDataBase();
        dataBase.groups = dataBase.groups.filter((value, key) => {
            return value.key != groupKey;
        });
        dataBase.groups.push(group);
        this.saveData(dataBase);
    }
    /**
     * Remove a group
     * @param predicate
     */
    removeGroup(predicate) {
        let data = this.getDataBase();
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
    editData(groupKey, dataId, newData) {
        var _a;
        let group = this.getGroup(groupKey) || { key: "", idCount: 0, data: [] };
        if (this.useDataManipulation && this.manipulations.filter(manipulation => manipulation.group == groupKey).length > 0) {
            newData = (_a = this.manipulations.find(x => x.event == data_1.DataEvent.OnEditData && x.group == groupKey)) === null || _a === void 0 ? void 0 : _a.function(newData);
        }
        if (this.useDataFilters && this.filters.filter(filter => filter.group == groupKey).length > 0) {
            for (let index = 0; index < this.filters.length; index++) {
                const filter = this.filters[index];
                if (filter.event == data_1.DataEvent.OnEditData && filter.group == groupKey) {
                    if (!filter.function(newData)) {
                        return;
                    }
                }
            }
        }
        for (let index = 0; index < (group === null || group === void 0 ? void 0 : group.data.length); index++) {
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
    getMultipleData(groupKey, dataPredicate) {
        var _a;
        let data = this.getDataBase();
        return ((_a = data.groups.find(group => group.key == groupKey)) === null || _a === void 0 ? void 0 : _a.data.filter(dataPredicate)) || [];
    }
    /**
     * Get all data from a group
     * @param groupKey
     * @returns `any[] | undefined`
     */
    getAllData(groupKey) {
        var _a;
        let data = this.getDataBase();
        return (_a = data.groups.find(group => group.key == groupKey)) === null || _a === void 0 ? void 0 : _a.data;
    }
    /**
     * Remove a data from a group
     * @param groupKey
     * @param dataPredicate
     */
    removeData(groupKey, dataPredicate) {
        //Load data
        let data = this.getDataBase();
        //Find group
        let group = data.groups.find(x => x.key == groupKey)
            || { key: "", idCount: 0, data: [] };
        group.data = group.data.filter((value, key) => {
            return !dataPredicate(value);
        });
        this.replaceGroup(group.key, group);
    }
}
exports.Parsin = Parsin;
exports.default = Parsin;
