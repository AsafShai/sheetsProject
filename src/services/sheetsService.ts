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
import { v4 as uuidv4 } from "uuid";

export class SheetsService {

    constructor(private db: IDatabaseConnection) {
        this.db = db;
    }
    async getSheetById(sheetId: string) {
        const getSheetQuery = `
            MATCH (sheet:Sheet {id: $sheetId})
            MATCH (sheet)-[:HAS_COLUMN]->(column:Column)
            OPTIONAL MATCH (column)-[:HAS_CELL]->(cell:Cell)
            OPTIONAL MATCH path = (cell)-[:LOOKUP*]->(endCell:Cell)
            WHERE NOT (endCell)-[:LOOKUP]->()
            
            WITH sheet, 
                column,
                COLLECT({
                    cellIndex: cell.cellIndex,
                    value: CASE
                        WHEN cell IS NULL THEN NULL
                        WHEN path IS NULL THEN cell.value
                        ELSE endCell.value
                    END
                }) as cells
            ORDER BY column.name
            
            WITH sheet,
                COLLECT({
                    name: column.name,
                    type: column.type,
                    cells: cells
                }) as columns
            
            RETURN 
                sheet.id as sheetId,
                columns
        `;
        const session = this.db.getDriver().session();
        try {
            const result = await session.run(getSheetQuery, { sheetId });

            if (result.records.length === 0) {
                throw new CustomError("Sheet not found", 404);
            }

            return result.records[0].toObject();
        } catch (error) {
            throw new CustomError("Error getting sheet", 500);
        } finally {
            await session.close();
        }
    }
    async setCellInSheet(
        setCellParams: SetCellInSheetParams,
        setCellBody: SetCellInSheetBody
    ): Promise<CellDBType> {
        const { sheetId, columnName } = setCellParams;
        if (setCellBody.value) {
            const columnType: ColumnType = await this.getColumnType(
                sheetId,
                columnName
            );
            return this.setCellByValue(
                setCellBody.cellIndex,
                setCellBody.value,
                columnType,
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

    private async getColumnType(
        sheetId: string,
        columnName: string
    ): Promise<ColumnType> {
        const query = `
        MATCH (s:Sheet {id: $sheetId})
        MATCH (s)-[HAS_COLUMN]->(c:Column {name: $columnName})
        RETURN c.type as type
        `;
        const params = {
            sheetId,
            columnName,
        };
        const session = this.db.getDriver().session();
        try {
            const result = await session.run(query, params);
            const columnType: ColumnType = result.records[0].get("type");
            return columnType;
        } catch (error) {
            throw new CustomError("Error getting column by type", 500);
        } finally {
            await session.close();
        }
    }

    private async setCellByValue(
        cellIndex: number,
        value: unknown,
        columnType: ColumnType,
        setCellParams: SetCellInSheetParams
    ): Promise<CellDBType> {
        if (!isSameType(value, columnType))
            throw new CustomError("Invalid value type", 400);
        const { sheetId, columnName }: SetCellInSheetParams = setCellParams;
        const query = `
        MATCH (s:Sheet {id: $sheetId})
        MATCH (s)-[HAS_COLUMN]->(c:Column {name: $columnName})
        MERGE (cell:Cell {cellIndex: $cellIndex})
        ON CREATE SET cell.value = $value
        ON MATCH SET cell.value = $value
        MERGE (c)-[:HAS_CELL]->(cell)
        RETURN cell
        `;
        const params = {
            sheetId,
            columnName,
            cellIndex,
            value,
        };
        const session = this.db.getDriver().session();
        try {
            const result = await session.run(query, params);
            return result.records[0].get("cell").properties;
        } catch (error) {
            throw new CustomError("Error setting cell by value", 500);
        } finally {
            await session.close();
        }
    }

    private async setCellByLookup(
        cellIndex: number,
        lookup: Lookup,
        setCellParams: SetCellInSheetParams
    ): Promise<CellDBType> {
        throw new CustomError("Not Implemented", 501);
    }

    async createSheet(columns: Column[]): Promise<string> {
        const query = `
            CREATE (s:Sheet {id: $id})
            WITH s
            UNWIND $columns as col
            CREATE (c:Column {name: col.name, type: col.type})
            CREATE (s)-[:HAS_COLUMN]->(c)
            WITH DISTINCT s
            RETURN s.id as id
            `;
        const params = {
            id: uuidv4(),
            columns,
        };
        const session = this.db.getDriver().session();
        try {
            const result = await session.run(query, params);
            return result.records[0].get("id");
        } catch (error) {
            throw new CustomError("Error creating sheet", 500);
        } finally {
            await session.close();
        }
    }
}
