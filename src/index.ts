import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USERNAME, PORT } from './utils/config';
import { errorHandlerMiddleware } from './middlwares/errorHandlerMiddleware';
import { Neo4JConnection } from './database/Neo4JConnection';
import { createSheetsRouter } from './routes/sheetsRoutes';


const app: Application = express();
app.use(express.json());
app.use(cors());

const dbConnection = new Neo4JConnection(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD);
const sheetsRouter = createSheetsRouter(dbConnection);

app.use("/api/sheets", sheetsRouter);

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
})

export default app;