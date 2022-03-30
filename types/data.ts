export type DataBase = {
    groups: DataGroup[]
}

export type DataBox = {
    id : number,
    data : any
}

export type DataGroup = {
    key: string
    idCount: number,
    data: DataBox[]
}


export type DataManipulator = (data: any) => any


export type FilterDataFunction = (data: any) => boolean

export enum DataEvent {
    OnAddData,
    OnEditData,
}

export type Filter = {
    event : DataEvent,
    group : string,
    function : FilterDataFunction

}

export type Manipulation = {
    event : DataEvent,
    group : string,
    function : DataManipulator

}