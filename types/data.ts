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