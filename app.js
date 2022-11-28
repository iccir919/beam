const express = require('express');
const path = require('path');
const { Client } = require('pg');
const PORT = process.env.PORT || 3000;

const app = express();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

client.connect();

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

app.get('/', (req, res) => {
    res.render('pages/index');
});