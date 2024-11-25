import neo4j, { Driver, RecordShape } from 'neo4j-driver'
import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USERNAME } from '../utils/config';
import { CellDBType, Column, ColumnType, IDatabaseConnection, SetCellInSheetParams, SheetDBType } from '../utils/types';
import { CustomError } from '../utils/CustomError';
import { v4 as uuidv4 } from "uuid";

export class Neo4JConnection implements IDatabaseConnection {
    private driver: Driver;

    constructor(private uri: string, private username: string, private password: string) {
        console.log('Connecting to Neo4J...');
        this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    }
    async getSheetById(sheetId: string): Promise<RecordShape> {
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
        const session = this.driver.session();
        try {
            const result = await session.run(getSheetQuery, { sheetId });
            if (result.records.length === 0) {
                throw new CustomError("Sheet not found", 404);
            }
            return result.records[0].toObject();
        } finally {
            await session.close();
        }
    }

    async getColumnType(sheetId: string, columnName: string): Promise<ColumnType> {
        const query = `
            MATCH (sheet:Sheet {id: $sheetId})
            MATCH (sheet)-[:HAS_COLUMN]->(column:Column {name: $columnName})
            RETURN column.type as type
        `;
        const params = {
            sheetId,
            columnName,
        };
        const session = this.driver.session();
        try {
            const result = await session.run(query, params);
            if (result.records.length === 0) {
                throw new CustomError("Column not found", 404);
            }
            return result.records[0].toObject().type;
        } finally {
            await session.close();
        }
    }

    async setCellByValue(
        cellIndex: number,
        value: unknown,
        setCellParams: SetCellInSheetParams
    ): Promise<CellDBType> {
        const { sheetId, columnName } = setCellParams;
        const query = `
            MATCH (sheet:Sheet {id: $sheetId})
            MATCH (sheet)-[:HAS_COLUMN]->(column:Column {name: $columnName})
            MATCH (column)-[:HAS_CELL]->(cell:Cell)
            WHERE cell.cellIndex = $cellIndex
            SET cell.value = $value
            RETURN cell
        `;
        const params = {
            sheetId,
            columnName,
            cellIndex,
            value,
        }
        const session = this.driver.session();
        try {
            const result = await session.run(query, params);
            return result.records[0].get("cell").properties;
        } catch (error) {
            throw new CustomError("Error setting cell by value", 500);
        } finally {
            await session.close();
        }
    }

    async createSheet(columns:Column[]): Promise<string> {
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
    const session = this.driver.session();
    try {
        const result = await session.run(query, params);
        return result.records[0].get("id");
    } catch (error) {
        throw new CustomError("Error creating sheet", 500);
    } finally {
        await session.close();
    }
    }


    closeConnection(): Promise<void> {
        return this.driver.close();
    }

    getDriver(): Driver {
        return this.driver;
    }
}
