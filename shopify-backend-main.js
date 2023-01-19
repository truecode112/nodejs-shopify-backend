import express from 'express';
import pkg from 'body-parser';
import dbConfig from './config/dbconfig.js';
import mongoose from 'mongoose';
import discount_router from './routes/discount.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { resolveNaptr } from 'dns';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { json } = pkg;
const app = express();
const port = 2389;

mongoose.connect(dbConfig.url, {
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

app.use(json());

app.get('/embeds/banner', (req, res) => res.sendFile('resources/sekanson_banner.html', {root: __dirname}));

app.param('file', function(req, res, next, id) {
    next();
});

app.get('/resources/:file', (req, res) => {
    res.sendFile(`resources/${req.params.file}`, { root: __dirname });
});
app.use('/api/discount', discount_router);

app.listen(
    port,
    () => console.log(`app listening at http://localhost:${port}`)
);