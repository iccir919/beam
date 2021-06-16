require('dotenv').config()
const express = require('express')
const admin = require('firebase-admin')
const plaid = require('plaid')
const app = express()
const PORT = process.env.PORT || 8000

app.use(express.urlencoded({extended: true}))
app.use(express.json()) // To parse the incoming requests with JSON payloads
app.use(express.static(__dirname + '/public'))

const plaidClient = new plaid.Client({
  clientID: process.env.PLAID_CLIENT_ID,
  secret: process.env.PLAID_SECRET,
  env: plaid.environments.sandbox,
  options: {
    version: '2020-09-14',
  },
});

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://beam-94bf1-default-rtdb.firebaseio.com"
});

app.get('/', (req, res) => {
  res.sendFile('views/index.html', { root: __dirname })
})

app.get('/profile', (req, res) => {
  res.sendFile('views/profile.html', { root: __dirname })
})

app.post('/api/link_token/get', (req, res) => {
  const response = plaidClient
  .createLinkToken({
    user: {
      client_user_id: '123-test-user-id',
    },
    client_name: 'Beam',
    products: ['transactions'],
    country_codes: ['US'],
    language: 'en',
    webhook: 'https://sample-web-hook.com',
    account_filters: {
      depository: {
        account_subtypes: ['checking', 'savings'],
      },
    },
  })
  .then((response) => {
    const linkToken = response.link_token;
    res.json({ "link_token": linkToken })
  })
  .catch((err) => {
    // handle error
  });
})

app.post('/api/user/get', (req, res) => {
  // Get a database reference to our users
  const uid = req.body.uid
  const userRef = admin.database().ref('users/' + uid)
  // Attach an asynchronous callback to read the data at our posts reference
  userRef.once('value', (snapshot) => {
    if( snapshot.val() === null ) {
      const usersRef = admin.database().ref('/users')
      const newUser = {
        createdAt: new Date().toUTCString()
      }
      usersRef.child(uid).set(newUser)
      res.json(newUser)
    } else {
      res.json(snapshot.val())
    }
  }, (errorObject) => {
    console.log('The read failed: ' + errorObject.name);
  });
})

app.post('/api/access_token/set', (req, res) => {
  // exchange public token for access token
  plaidClient
    .exchangePublicToken(req.body.public_token)
    .then(response => {
      const accessToken = response.access_token;
      const itemId = response.item_id;
      const uid = req.body.uid;

    })
    .catch(err => {
      console.log(err)
    })
})


app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
