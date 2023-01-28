import express from 'express';
import pkg from 'body-parser';
import dbConfig from './config/dbconfig.js';
import discount_router from './routes/discount.js';
import app_router from './routes/application.js';
import project_router from './routes/projects.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { json } = pkg;
const app = express();
const port = 2389;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'alek_db',
    password: '(&zjn$#2Z',
    database: 'slimprints'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Server!');
});

app.use(json());
app.use(cors());

app.get('/embeds/banner', (req, res) => res.sendFile('resources/sekanson_banner.html', {root: __dirname}));

app.get('/resources/:file', (req, res) => {
    res.sendFile(`resources/${req.params.file}`, { root: __dirname });
});
app.use('/api/discount', discount_router);
app.use('/api/applications', app_router);
app.use('/api/projects', project_router);

app.listen(
    port,
    () => console.log(`app listening at http://localhost:${port}`)
);