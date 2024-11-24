import { Router } from "express";
import { SheetsController } from "../controllers/sheetsController";

const sheetRouter = Router();

sheetRouter.get('/:sheetId', SheetsController.getSheetById);
sheetRouter.put('/:sheetId/columns/:columnName/cell', SheetsController.setCellInSheet);
sheetRouter.post('/', SheetsController.createSheet);


export default sheetRouter;