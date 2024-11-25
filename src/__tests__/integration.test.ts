import request from "supertest";
import app from "../index";
import { Neo4JConnection } from "../database/Neo4JConnection";
import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USERNAME } from "../utils/config";

describe("integration test", () => {
    let dbConnection: Neo4JConnection;

    beforeAll(() => {
        dbConnection = new Neo4JConnection(
            NEO4J_URI,
            NEO4J_USERNAME,
            NEO4J_PASSWORD
        );
    });

    const runQuery = async (
        query: string,
        params: Record<string, unknown> = {}
    ) => {
        const session = dbConnection.getDriver().session();
        try {
            const result = await session.run(query, params);
            return result.records;
        } finally {
            await session.close();
        }
    };

    afterAll(async () => {
        await runQuery(`MATCH (n) DETACH DELETE n`);
        await dbConnection.closeConnection();
    });
    describe("POST /api/sheets", () => {
        it("should create sheet in neo4j and return 201 for valid post request", async () => {
            const postBody = {
                columns: [
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
                ],
            };
            const res = await request(app).post("/api/sheets").send(postBody);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");

            const sheetId = res.body.id;
            const query = `MATCH (s:Sheet {id: $sheetId}) RETURN s as sheet`;
            const params = { sheetId };
            const result = await runQuery(query, params);
            expect(result.length).toBe(1);
            expect(result[0].get("sheet").properties.id).toBe(sheetId);
        });
    });
});
