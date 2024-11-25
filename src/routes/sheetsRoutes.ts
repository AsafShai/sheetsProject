import { Router } from "express";
import { SheetsController } from "../controllers/sheetsController";
import { Neo4JConnection } from "../database/Neo4JConnection";
import { SheetsService } from "../services/sheetsService";


const dbConnection = new Neo4JConnection()
const sheetsService = new SheetsService(dbConnection);
const sheetsController = new SheetsController(sheetsService);

const sheetRouter = Router();

sheetRouter.get('/:sheetId', sheetsController.getSheetById);
sheetRouter.put('/:sheetId/columns/:columnName/cell', sheetsController.setCellInSheet);
sheetRouter.post('/', sheetsController.createSheet);


export default sheetRouter;