
require('dotenv').config();
const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const plaid = require('plaid');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");

const APP_PORT = process.env.APP_PORT || 8000;

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://beam-fdfaa-default-rtdb.firebaseio.com"
});

const databaseReference = firebaseAdmin.database();


const app = express();
app.use(express.static('public'));
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(bodyParser.json());



app.get('/', function (req, res, next) {
    res.sendFile('./views/index.html', { root: __dirname })
});

app.get('/user/:userId', function(req, res) {
    const ref = databaseReference.ref(`users/${req.params.userId}`)
    ref.once("value")
        .then(function(snapshot) {

            res.send(`
                User found? ${snapshot.exists()}
                Name: ${snapshot.child("name").val()}
            `)
        })
})

const server = app.listen (APP_PORT, function () {
    console.log('Beam server listening on port ' + APP_PORT);
});

const prettyPrintResponse = response => {
    console.log(util.inspect(response, { colors: true, depth: 4 }))
};
