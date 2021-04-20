// read env vars from .env file
require('dotenv').config();

const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const plaid = require('plaid');

const APP_PORT = process.env.APP_PORT || 8000;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || 'transactions').split(
    ',',
);

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(
    ',',
);

// Store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;

const client = new plaid.Client({
    clientID: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    env: plaid.environments[PLAID_ENV],
    options: {
        version: '2019-05-29'
    },
});

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

app.post('/api/info', function (request, response, next) {
    console.log('Request received to /api/info');
    const info = {
        item_id: ITEM_ID,
        access_token: ACCESS_TOKEN,
        products: PLAID_PRODUCTS,
    };
    console.log(info);
    response.json(info)
});

// Create a link token with configs which we can then use to initialize Plaid Link client-side.
// See https://plaid.com/docs/#create-link-token
app.post('/api/create_link_token', function (request, response, next) {
    const configs = {
        user: {
            client_user_id: 'unique-user-id'
        },
        client_name: 'Beam',
        products: PLAID_PRODUCTS,
        country_codes: PLAID_COUNTRY_CODES,
        language: 'en'
    };

    client.createLinkToken( configs, function (error, createTokenResponse ) {
        if(error != null) {
            prettyPrintResponse(error);
            return response.json({
                error: error,
            });
        }
        console.log("Link token created:")
        prettyPrintResponse(createTokenResponse)
        response.json(createTokenResponse);
    });
});

const server = app.listen (APP_PORT, function () {
    console.log('Beam server listening on port ' + APP_PORT);
});

const prettyPrintResponse = response => {
    console.log(util.inspect(response, { colors: true, depth: 4 }))
};
