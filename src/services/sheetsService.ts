import { Neo4JConnection } from "../database/Neo4JConnection";
import { CustomError } from "../utils/CustomError";
import {
    CellDBType,
    Column,
    ColumnType,
    IDatabaseConnection,
    isSameType,
    Lookup,
    SetCellInSheetBody,
    SetCellInSheetParams,
} from "../utils/types";

export class SheetsService {

    constructor(private db: IDatabaseConnection) {
        this.db = db;
    }
    async getSheetById(sheetId: string) {
        try {
            return await this.db.getSheetById(sheetId);
        } catch (error) {
            if (error instanceof CustomError)
                throw error;
            throw new CustomError("Error getting sheet", 500);
        } 
    }
    async setCellInSheet(
        setCellParams: SetCellInSheetParams,
        setCellBody: SetCellInSheetBody
    ): Promise<CellDBType> {
        const { sheetId, columnName } = setCellParams;
        if (setCellBody.value) {
            const columnType: ColumnType = await this.db.getColumnType(
                sheetId,
                columnName
            );
            if (!isSameType(setCellBody.value, columnType))
                throw new CustomError("Invalid value type", 400);
            return this.db.setCellByValue(
                setCellBody.cellIndex,
                setCellBody.value,
                setCellParams
            );
        } else if (setCellBody.lookup) {
            return this.setCellByLookup(
                setCellBody.cellIndex,
                setCellBody.lookup,
                setCellParams
            );
        }
        throw new CustomError("Not Implemented", 501);
    }

    private async setCellByLookup(
        cellIndex: number,
        lookup: Lookup,
        setCellParams: SetCellInSheetParams
    ): Promise<CellDBType> {
        throw new CustomError("Not Implemented", 501);
    }

    async createSheet(columns: Column[]): Promise<string> {
        try {
            return this.db.createSheet(columns);
        } catch (error) {
            if (error instanceof CustomError)
                throw error;
            throw new CustomError("Error getting sheet", 500);
        } 
    }
}
