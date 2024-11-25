import { NextFunction, Request, Response } from "express";
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

    constructor(private readonly sheetsService: SheetsService) {
        this.sheetsService = sheetsService;
    }

    setCellInSheet = async (
        req: Request<SetCellInSheetParams, SetCellInSheetBody>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const setCellParams: SetCellInSheetParams = req.params;
        const SetCellBody: SetCellInSheetBody = req.body;
        const parsedSetCellBody =
            setCellInSheetBodySchema.safeParse(SetCellBody);
        if (!parsedSetCellBody.success) {
            res.status(400).json({ error: parsedSetCellBody.error });
            return;
        }
    }

    getSheetById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { sheetId } = req.params;
        try {
            const sheet = await this.sheetsService.getSheetById(sheetId);
            res.status(200).json(sheet);
        } catch (error) {
            next(error);
        }
    }

    createSheet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
            const id = await this.sheetsService.createSheet(sheetColumns);
            res.status(201).json({ id });
            return;
        } catch (error) {
            next(error);
        }
    }
}
