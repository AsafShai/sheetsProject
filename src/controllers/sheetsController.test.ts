
import { Request, Response } from "express";
import { SheetsService } from "../services/sheetsService";
import { SheetsController } from "./sheetsController";
import {
    Column,
    SetCellInSheetBody,
    SetCellInSheetParams,
} from "../utils/types";

describe("SheetsController", () => {
    let mockedSheetsService: jest.Mocked<SheetsService>;
    let sheetsController: SheetsController;

    describe("setCellInSheet", () => {
        it("should set a cell in a sheet when valid parameters and body are provided", async () => {
            mockedSheetsService = {
                setCellInSheet: jest
                    .fn()
                    .mockResolvedValue({ cellIndex: 1, value: "test" }),
            } as unknown as jest.Mocked<SheetsService>;
            sheetsController = new SheetsController(mockedSheetsService);
            const setCellInSheetParams: SetCellInSheetParams = {
                sheetId: "1",
                columnName: "test",
            };

            const setCellInSheetBody: SetCellInSheetBody = {
                cellIndex: 1,
                value: 5,
            };

            const req = {
                params: setCellInSheetParams,
                body: setCellInSheetBody,
            } as Request<SetCellInSheetParams, SetCellInSheetBody>;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            const next = jest.fn();

            await sheetsController.setCellInSheet(req, res, next);

            expect(mockedSheetsService.setCellInSheet).toHaveBeenCalledWith(
                req.params,
                req.body
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                cellIndex: 1,
                value: "test",
            });
        });

        it("should return 400 when no value or lookup is provided", async () => {
            mockedSheetsService = {
                setCellInSheet: jest.fn(),
            } as unknown as jest.Mocked<SheetsService>;
            sheetsController = new SheetsController(mockedSheetsService);
            const setCellInSheetParams: SetCellInSheetParams = {
                sheetId: "1",
                columnName: "test",
            };
            const setCellInSheetBody: SetCellInSheetBody = {
                cellIndex: 1,
            };
            const req = {
                params: setCellInSheetParams,
                body: setCellInSheetBody,
            } as Request<SetCellInSheetParams, SetCellInSheetBody>;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            const next = jest.fn();

            await sheetsController.setCellInSheet(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockedSheetsService.setCellInSheet).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                error: expect.any(Object),
            });
        });

        it("should call next with the error if the service throws an error", async () => {
            let mockedError = new Error("Test error");
            mockedSheetsService = {
                setCellInSheet: jest.fn().mockRejectedValue(mockedError),
            } as unknown as jest.Mocked<SheetsService>;
            sheetsController = new SheetsController(mockedSheetsService);
            const setCellInSheetParams: SetCellInSheetParams = {
                sheetId: "1",
                columnName: "test",
            };
            const setCellInSheetBody: SetCellInSheetBody = {
                cellIndex: 1,
                value: 5,
            };
            const req = {
                params: setCellInSheetParams,
                body: setCellInSheetBody,
            } as Request<SetCellInSheetParams, SetCellInSheetBody>;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();
            await sheetsController.setCellInSheet(req, res, next);
            expect(next).toHaveBeenCalledWith(mockedError);
        });
    });

    describe("getSheetById", () => {
        it("should call the service and return the result", async () => {
            const sheetId = "1";
            const mockedSheetsService = {
                getSheetById: jest.fn().mockResolvedValue({
                    sheetId: sheetId,
                    columns: [
                        {
                            cells: [
                                {
                                    cellIndex: 10,
                                    value: "hello",
                                },
                            ],
                            name: "A",
                            type: "string",
                        },
                        {
                            cells: [
                                {
                                    cellIndex: 11,
                                    value: true,
                                },
                            ],
                            name: "B",
                            type: "boolean",
                        },
                    ],
                }),
            } as unknown as jest.Mocked<SheetsService>;
            sheetsController = new SheetsController(mockedSheetsService);
            const req = {
                params: { sheetId },
            } as Request<{ sheetId: string }>;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();
            await sheetsController.getSheetById(req, res, next);
            expect(mockedSheetsService.getSheetById).toHaveBeenCalledWith(
                sheetId
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                sheetId,
                columns: [
                    {
                        cells: [
                            {
                                cellIndex: expect.any(Number),
                                value: expect.any(String),
                            },
                        ],
                        name: expect.any(String),
                        type: "string",
                    },
                    {
                        cells: [
                            {
                                cellIndex: expect.any(Number),
                                value: expect.any(Boolean),
                            },
                        ],
                        name: "B",
                        type: "boolean",
                    },
                ],
            });
        });

        it("should call next with the error if the service throws an error", async () => {
            let mockedError = new Error("Test error");
            mockedSheetsService = {
                getSheetById: jest.fn().mockRejectedValue(mockedError),
            } as unknown as jest.Mocked<SheetsService>;
            sheetsController = new SheetsController(mockedSheetsService);
            const setCellInSheetParams: SetCellInSheetParams = {
                sheetId: "1",
                columnName: "test",
            };
            const setCellInSheetBody: SetCellInSheetBody = {
                cellIndex: 1,
                value: 5,
            };
            const req = {
                params: setCellInSheetParams,
                body: setCellInSheetBody,
            } as Request<SetCellInSheetParams, SetCellInSheetBody>;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();
            await sheetsController.getSheetById(req, res, next);
            expect(next).toHaveBeenCalledWith(mockedError);
        });
    });

    describe("createSheet", () => {
        it("should call the service and return the result", async () => {
            const columns: Column[] = [
                {
                    name: "D",
                    type: "string",
                },
                {
                    name: "E",
                    type: "boolean",
                },
                {
                    name: "F",
                    type: "string",
                },
            ];
            const createSheetBody = {
                columns,
            };
            const mockedSheetsService = {
                createSheet: jest.fn().mockResolvedValue("123"),
            } as unknown as jest.Mocked<SheetsService>;
            sheetsController = new SheetsController(mockedSheetsService);
            const req = {
                body: createSheetBody,
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();
            await sheetsController.createSheet(req, res, next);
            expect(mockedSheetsService.createSheet).toHaveBeenCalledWith(
                createSheetBody.columns
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                id: "123",
            });
        });

        it("should return 400 if the request body is invalid", async () => {
            const invalidColumns = [
                {
                    name: "A",
                    anotherKey: "hello"
                },
                {
                    name: "E",
                    anotherKey: "hello"
                },
                {
                    name: "F",
                    anotherKey: "hello"
                },
            ];
            const createSheetBody = {
                columns: invalidColumns,
            };
            const mockedSheetsService = {
                createSheet: jest.fn().mockResolvedValue("123"),
            } as unknown as jest.Mocked<SheetsService>;
            sheetsController = new SheetsController(mockedSheetsService);
            const req = {
                body: createSheetBody,
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();
            await sheetsController.createSheet(req, res, next);
            expect(mockedSheetsService.createSheet).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: expect.any(Object),
            });
        });

        it("should return 400 if there are two columns with same name", async () => {
            const columns: Column[] = [
                {
                    name: "D",
                    type: "string",
                },
                {
                    name: "D",
                    type: "boolean",
                },
                {
                    name: "F",
                    type: "string",
                },
            ];
            const createSheetBody = {
                columns,
            };
            const mockedSheetsService = {
                createSheet: jest.fn().mockResolvedValue("123"),
            } as unknown as jest.Mocked<SheetsService>;
            sheetsController = new SheetsController(mockedSheetsService);
            const req = {
                body: createSheetBody,
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();
            await sheetsController.createSheet(req, res, next);
            expect(mockedSheetsService.createSheet).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: expect.any(String)
            });
        });

        it("should call next with the error if the service throws an error", async () => {
            let mockedError = new Error("Test error");
            const mockedSheetsService = {
                createSheet: jest.fn().mockRejectedValue(mockedError),
            } as unknown as jest.Mocked<SheetsService>;
            const columns: Column[] = [
                {
                    name: "C",
                    type: "string",
                },
                {
                    name: "D",
                    type: "boolean",
                },
                {
                    name: "F",
                    type: "string",
                },
            ];
            const createSheetBody = {
                columns,
            };
            sheetsController = new SheetsController(mockedSheetsService);
            const req = {
                body: createSheetBody,
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();
            await sheetsController.createSheet(req, res, next);
            expect(next).toHaveBeenCalledWith(mockedError);
        });
        
    });
});
