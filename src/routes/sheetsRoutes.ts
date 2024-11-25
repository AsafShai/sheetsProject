import { Router } from "express";
import { SheetsController } from "../controllers/sheetsController";
import { Neo4JConnection } from "../database/Neo4JConnection";
import { SheetsService } from "../services/sheetsService";
import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USERNAME } from "../utils/config";

export const createSheetsRouter = (dbConnection: Neo4JConnection) => {
    const db =
        dbConnection ||
        new Neo4JConnection(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD);
    const sheetsService = new SheetsService(db);
    const sheetsController = new SheetsController(sheetsService);

    const sheetRouter = Router();

    sheetRouter.get("/:sheetId", sheetsController.getSheetById);
    sheetRouter.put(
        "/:sheetId/columns/:columnName/cell",
        sheetsController.setCellInSheet
    );
    sheetRouter.post("/", sheetsController.createSheet);
    return sheetRouter;
};

