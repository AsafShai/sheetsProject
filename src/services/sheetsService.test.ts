import { SheetsService } from "./sheetsService";
import { CustomError } from "../utils/CustomError";
import { IDatabaseConnection, SetCellInSheetBody, SetCellInSheetParams } from "../utils/types";

describe("SheetsService", () => {
    let mockDb: jest.Mocked<IDatabaseConnection>;
    let sheetsService: SheetsService;

    
    describe("getSheetById", () => {
        const mockSheetId = "test-sheet-id";
        const mockSheetData = {
            id: mockSheetId,
            columns: [
                {
                    name: "Column1",
                    type: "string",
                    cells: [{ cellIndex: 0, value: "test" }],
                },
            ],
        };

        beforeEach(() => {
            mockDb = {
                getDriver: jest.fn(),
                closeConnection: jest.fn(),
                getSheetById: jest.fn(),
                getColumnType: jest.fn(),
                setCellByValue: jest.fn(),
                createSheet: jest.fn(),
            } as jest.Mocked<IDatabaseConnection>;
    
            sheetsService = new SheetsService(mockDb);
        });
        
        it("should successfully return sheet data", async () => {
            mockDb.getSheetById.mockResolvedValueOnce(mockSheetData);

            const result = await sheetsService.getSheetById(mockSheetId);

            expect(result).toEqual(mockSheetData);
            expect(mockDb.getSheetById).toHaveBeenCalledWith(mockSheetId);
            expect(mockDb.getSheetById).toHaveBeenCalledTimes(1);
        });
    });

    describe("setCellInSheet", () => {
        let mockDb: jest.Mocked<IDatabaseConnection>;
        let service: SheetsService;
    
        beforeEach(() => {
            mockDb = {
                getColumnType: jest.fn().mockResolvedValue('int'),
                setCellByValue: jest.fn().mockResolvedValue({ cellIndex: 1, value: 42 }),
                getDriver: jest.fn(),
                closeConnection: jest.fn(),
                getSheetById: jest.fn(),
                createSheet: jest.fn(),
            } as jest.Mocked<IDatabaseConnection>;
    
            service = new SheetsService(mockDb);
        });

        it('should set cell value when type matches column type', async () => {
            const params: SetCellInSheetParams = { sheetId: 'sheet1', columnName: 'A' };
            const body: SetCellInSheetBody = { cellIndex: 1, value: 42 };
        
            const result = await service.setCellInSheet(params, body);
        
            expect(mockDb.getColumnType).toHaveBeenCalledWith('sheet1', 'A');
            expect(mockDb.setCellByValue).toHaveBeenCalledWith(1, 42, params);
            expect(result).toEqual({ cellIndex: 1, value: 42 });
        });

        it('should throw CustomError with status 400 for type mismatch', async () => {
            const params = { sheetId: 'sheet1', columnName: 'A' };
            const body = { cellIndex: 1, value: 'some string' };
        
            await expect(service.setCellInSheet(params, body)).rejects.toThrow(CustomError);
            await expect(service.setCellInSheet(params, body)).rejects.toThrow('Invalid value type');
        });
    })
});
