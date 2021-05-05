
require('dotenv').config();

const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');

const moment = require('moment');
const plaid = require('plaid');

const firebaseAdmin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

const PORT = process.env.PORT || 8000;

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;



const PLAID_ENV = process.env.PLAID_ENV;
const PLAID_PRODUCTS = ['transactions'];
const PLAID_COUNTRY_CODES = ['US', 'CA'];

const client = new plaid.Client({
    clientID: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    env: plaid.environments[PLAID_ENV],
    options: {
        version: '2019-05-29'
    }
});

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
});


app.post('/api/create_link_token', function(req, res) {

    const configs = {
        'user': {
            'client_user_id': req.body.uid
        },
        'client_name': "Beam",
        'products': PLAID_PRODUCTS,
        'country_codes': PLAID_COUNTRY_CODES,
        'language': "en"
    };

    client.createLinkToken(configs, function(error, createTokenResponse) {
        if (error !== null) {
            return res.json({
                error: error
            });
        }
        res.json(createTokenResponse);
    });
});

app.post('/api/set_access_token', function(req, res) {
    const PUBLIC_TOKEN = req.body.public_token;
    client.exchangePublicToken(PUBLIC_TOKEN, function(error, tokenResponse) {
        if (error != null) {
            return response.json({
              error: error,
            });
        }
        const itemsRef = databseRef.ref(`users/${req.body.uid}/items`);
        const newItemRef = itemsRef.push();
        newItemRef.set({
            access_token: tokenResponse.access_token,
            item_id: tokenResponse.item_id
        });
        res.json({ access_token: tokenResponse.access_token })
    });
});

app.post('/api/accounts/get', function(req, res) {
    const itemsRef = databseRef.ref(`users/${req.body.uid}/items`);
    itemsRef.on("value", function(snapshot) {
        const items = snapshot.val();
        let access_tokens = [];
        for (let item in items) {
            if (items.hasOwnProperty(item)) {
                access_tokens.push(items[item].access_token);
            }
        }

        Promise.all(access_tokens.map(access_token => {
            return client.getAccounts(access_token)
        }))
        .then(data => {
            const accounts = [].concat.apply([], data.map(item => {
                return item.accounts
            }));
            res.json({ accounts: accounts });
        });

    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
});

const server = app.listen (PORT, function () {
    console.log('Beam server listening on port ' + PORT);
});

const prettyPrintResponse = response => {
    console.log(util.inspect(response, { colors: true, depth: 4 }))
};
