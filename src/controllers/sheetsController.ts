import { Request, Response } from "express";
import z from "zod";
import {
    createSheetSchema,
    setCellInSheetBodySchema,
} from "../utils/zodSchemas";
import {
    CellDBType,
    Column,
    SetCellInSheetBody,
    SetCellInSheetParams,
} from "../utils/types";
import { SheetsService } from "../services/sheetsService";

export class SheetsController {
    static async setCellInSheet(
        req: Request<SetCellInSheetParams, SetCellInSheetBody>,
        res: Response
    ): Promise<void> {
        const setCellParams: SetCellInSheetParams = req.params;
        const SetCellBody: SetCellInSheetBody = req.body;
        const parsedSetCellBody =
            setCellInSheetBodySchema.safeParse(SetCellBody);
        if (!parsedSetCellBody.success) {
            res.status(400).json({ error: parsedSetCellBody.error });
            return;
        }

        try {
            const cell: CellDBType = await SheetsService.setCellInSheet(
                setCellParams,
                parsedSetCellBody.data
            );
            res.status(200).json({ cell });
            return;
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
            return;
        }
    }

    static async getSheetById(req: Request, res: Response): Promise<void> {
        //TODO: implement
        const { sheetId } = req.params;
        try {
            const sheet = await SheetsService.getSheetById(sheetId);
            res.status(200).json(sheet);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
            return;
        }
        
    }

    static async createSheet(req: Request, res: Response): Promise<void> {
        const sheet = req.body;
        const parsedSheet = createSheetSchema.safeParse(sheet);
        if (!parsedSheet.success) {
            res.status(400).json({ error: parsedSheet.error });
            return;
        }
        const sheetColumns: Column[] = parsedSheet.data.columns;
        const columnsSet = new Set(sheetColumns.map((column) => column.name));
        if (columnsSet.size !== sheetColumns.length) {
            res.status(400).json({ error: "Duplicate column names" });
            return;
        }
        try {
            const id = await SheetsService.createSheet(sheetColumns);
            res.status(201).json({ id });
            return;
        } catch (error) {
            res.status(500).json({ error: "Error while creating sheet" });
            //TODO: error handling with custom errors
            return;
        }
    }
}
