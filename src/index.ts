import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import sheetsRoutes from './routes/sheetsRoutes';
import { PORT } from './utils/config';
import { errorHandlerMiddleware } from './controllers/middlwares/errorHandlerMiddleware';


const app: Application = express();
app.use(express.json());
app.use(cors());

app.use("/api/sheets", sheetsRoutes);

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
})

export default app;