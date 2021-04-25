
require('dotenv').config();
require('firebase/analytics');
require('firebase/auth');

const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const plaid = require('plaid');

const APP_PORT = process.env.APP_PORT || 8000;

const app = express();
app.use(express.static('public'));
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(bodyParser.json());

app.get('/', function (request, response, next) {
    response.sendFile('./views/index.html', { root: __dirname })
});

const server = app.listen (APP_PORT, function () {
    console.log('Beam server listening on port ' + APP_PORT);
});

const prettyPrintResponse = response => {
    console.log(util.inspect(response, { colors: true, depth: 4 }))
};
