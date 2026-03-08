import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { router } from './routes';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', router);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
