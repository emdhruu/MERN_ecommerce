import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDb } from './config/db';
import routes from './routes/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDb();
});