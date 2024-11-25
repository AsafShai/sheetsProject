import z from "zod";
import { columnSchema, columnTypeEnum, lookupSchema, setCellInSheetBodySchema } from "./zodSchemas";
import { Driver, RecordShape } from "neo4j-driver";

export type ColumnType = z.infer<typeof columnTypeEnum>;
export type Column = z.infer<typeof columnSchema>;

export type CellDBType = {
    cellIndex: number;
    value: unknown;
};

export type ColumnDBType = Column & { cells: CellDBType[] };

export type SheetDBType = {
    id: string;
    columns: ColumnDBType[];
};

export type SetCellInSheetParams = {
    sheetId: string;
    columnName: string;
};

export type Lookup = z.infer<typeof lookupSchema>;
export type SetCellInSheetBody = z.infer<typeof setCellInSheetBodySchema>;


const typeLookup = {
    string: "string",
    int: "number",
    double: "number",
    boolean: "boolean",
} as const;

export const isSameType = (value: unknown, columnType: ColumnType): boolean => {
    const expectedType: string = typeLookup[columnType];
    if (columnType === "int")
        return typeof value === "number" && Number.isInteger(value);
    if (columnType === "double")
        return typeof value === "number" && !Number.isInteger(value);
    return typeof value === expectedType;
}

export interface IDatabaseConnection {
    getDriver: () => Driver;
    closeConnection: () => Promise<void>;
}