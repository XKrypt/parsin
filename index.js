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
const fs = __importStar(require("fs"));
class Parsim {
    constructor(filePath, loadDataInMemory = false, encoding = 'utf-8') {
        this.encondig = 'utf8';
        this.data = {
            groups: []
        };
        this.filePath = filePath;
        this.loadDataInMemory = loadDataInMemory;
        this.encondig = encoding;
        this.initialize();
        if (loadDataInMemory) {
            this.loadInMemory(encoding);
        }
    }
    //create file if don´t exist
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
    //Load from file
    loadFileData(fileEncode = 'utf-8') {
        return JSON.parse(fs.readFileSync(this.filePath, { encoding: 'utf8', flag: 'r' }));
    }
    saveData(data) {
        let dataJson = JSON.stringify(data);
        fs.writeFileSync(this.filePath, dataJson);
    }
    //Get single data from a group
    getSingleData(groupKey, dataPredicate) {
        //Load data
        let data = this.getDataBase();
        //Find group
        let groups = data.groups.find(x => x.key == groupKey) ||
            { key: "", idCount: 0, data: [] };
        //Find data in the group
        for (let index = 0; index < groups.data.length; index++) {
            const dataBox = groups.data[index];
            if (dataPredicate(dataBox)) {
                return dataBox;
            }
        }
    }
    //Reload data from file, Warning : only work if loadInMemory is true
    reloadDataFromFile() {
        if (this.loadDataInMemory) {
            this.loadInMemory(this.encondig);
        }
    }
    getDataBase() {
        let data = this.loadDataInMemory ? this.data : this.loadFileData();
        return data;
    }
    //Get group
    getGroup(key) {
        let data = this.getDataBase();
        return data.groups.find(x => x.key == key);
    }
    getMultipleGroups(groupPredicate) {
        let data = this.getDataBase();
        return data.groups.filter(groupPredicate) || [];
    }
    //Add new group
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
    addData(groupKey, value) {
        let dataBase = this.getDataBase();
        //Find group
        let group = dataBase.groups.find(x => x.key == groupKey)
            || { key: "", idCount: 0, data: [] };
        //increase counting to be used in id
        group.idCount++;
        group.data.push({
            data: value,
            id: group.idCount
        });
        for (let index = 0; index < dataBase.groups.length; index++) {
            if (dataBase.groups[index].key == group.key) {
                dataBase.groups[index] = group;
            }
        }
        this.saveData(dataBase);
    }
    replaceGroup(groupKey, group) {
        let dataBase = this.getDataBase();
        dataBase.groups = dataBase.groups.filter((value, key) => {
            return value.key != groupKey;
        });
        dataBase.groups.push(group);
        this.saveData(dataBase);
    }
    removeGroup(predicate) {
        let data = this.getDataBase();
        data.groups = data.groups.filter((value, index) => {
            return !predicate(value);
        });
        this.saveData(data);
    }
    getMultipleData(groupKey, dataPredicate) {
        var _a;
        let data = this.getDataBase();
        return ((_a = data.groups.find(group => group.key == groupKey)) === null || _a === void 0 ? void 0 : _a.data.filter(dataPredicate)) || [];
    }
    getAllData(groupKey) {
        var _a;
        let data = this.getDataBase();
        return (_a = data.groups.find(group => group.key == groupKey)) === null || _a === void 0 ? void 0 : _a.data;
    }
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
exports.default = Parsim;
