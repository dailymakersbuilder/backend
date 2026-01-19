import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './config/db';
import { errorHandler } from './middlewares/errorhandler';
import "./config/firebase"
import routes from "./modules/router"
import "./modules/notifications/notification.cron"

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('DM server is Running!');
});

app.use("/api", routes);

app.use(errorHandler);

app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on http://localhost:${PORT}`);
});