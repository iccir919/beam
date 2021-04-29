
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

const databseRef = firebaseAdmin.database();


const app = express();
app.use(express.static('public'));
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(bodyParser.json());



app.get('/', function (req, res, next) {
    res.sendFile('./views/index.html', { root: __dirname });
});

app.get('/user/:uid', function(req, res) {
    const userRef = databseRef.ref(`users/${req.params.uid}`)
    userRef.once("value")
        .then(function(snapshot) {
            if (snapshot.exists()) {
                res.sendFile('./views/profile.html', { root: __dirname });
            } else {
                firebaseAdmin
                    .auth()
                    .getUser(req.params.uid)
                    .then((userRecord) => {
                        const usersRef = databseRef.ref("users");
                        usersRef.child(req.params.uid).set({
                            email: userRecord.email,
                            createdAt: Date.now(),
                            displayName: userRecord.displayName
                        }, function() {
                            res.sendFile('./views/profile.html', { root: __dirname });
                        })
                    })
                    .catch((error) => {
                        console.log('Error fetching user data:', error);
                    });
            }
        })
})

const server = app.listen (APP_PORT, function () {
    console.log('Beam server listening on port ' + APP_PORT);
});

const prettyPrintResponse = response => {
    console.log(util.inspect(response, { colors: true, depth: 4 }))
};
