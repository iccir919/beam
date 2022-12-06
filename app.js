require('dotenv').config();

const express = require('express');
const app = express();

const path = require('path');

const PORT = process.env.PORT || 3000;

const db = require('./queries');

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/users', db.getUsers);
app.get('/users/:id', db.getUserById);
app.post('/users', db.createUser);

app.get('/', (req, res) => {
    res.render('pages/index');
});


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

