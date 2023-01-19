import express from 'express';
import pkg from 'body-parser';
const { json } = pkg;
const app = express();
const port = 2389;

import discount_router from './routes/discount.js';

app.use(json());

app.get('/', (req, res) => res.send("Hello! This is Shopify backend"))

app.use('/api/discount', discount_router);

app.listen(
    port,
    () => console.log(`app listening at http://localhost:${port}`)
);