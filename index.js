require('dotenv').config()
const express = require('express')
const admin = require('firebase-admin')
const plaid = require('plaid')
const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
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
  plaidClient.createLinkToken({
    user: {
      client_user_id: req.body.uid,
    },
    client_name: 'Beam',
    products: ['transactions'],
    country_codes: ['US'],
    language: 'en',
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
  });
})

app.post('/api/user/get', (req, res) => {
  const userRef = admin.database().ref('users/' + req.body.uid)
  userRef.once('value', (snapshot) => {
    if (snapshot.val()) {
      res.json({
        createdAt: snapshot.val().createdAt,
        item_ids: snapshot.val().items ?
          Object.keys(snapshot.val().items)
          : undefined
      })
    } else {
      const usersRef = admin.database().ref('users')
      const newUser = {
        createdAt: new Date().toUTCString()
      }
      usersRef.child(req.body.uid).set(newUser)
      res.json(newUser)
    }
  })
})

app.post('/api/access_token/set', (req, res) => {
  // exchange public token for access token
  plaidClient
    .exchangePublicToken(req.body.public_token)
    .then(response => {
      const access_token = response.access_token;
      const item_id = response.item_id;
      const uid = req.body.uid;

      // save item
      const itemRef = admin.database().ref('/users/' + uid + '/items/' + item_id)
      itemRef.set({
        access_token: access_token,
        createdAt: new Date().toUTCString()
      })
      res.json({item_id: response.item_id})
    })
})

app.post('/api/item/get', (req, res) => {
  let result = {}
  getAccessToken(
    req.body.item_id,
    req.body.uid,
    function(err, access_token) {
      plaidClient.getItem(access_token, function(err, item_object) {
        plaidClient.getInstitutionById(
          item_object.item.institution_id,
          ['US', 'CA'], {},
          function(err, institituionData) {
            result.item_id = item_object.item.item_id
            result.institution = {}
            result.status = item_object.status
            result.institution.institution_id = institituionData.institution.institution_id
            result.institution.name = institituionData.institution.name
            res.json(result)
          }
        )
      })
    }
  )
})

app.post('/api/accounts/get', (req, res) => {
  getAccessToken(
    req.body.item_id,
    req.body.uid,
    function(err, access_token) {
      plaidClient.getAccounts(access_token, {}, function(err, accounts_object) {
        accounts_object.accounts = accounts_object.accounts.filter(
          account => account.subtype === "checking"
          || account.subtype === "savings"
          || account.type === "credit"
        )
        res.json({
          item_id: req.body.item_id,
          accounts: accounts_object.accounts
        })
      })
    }
  )
})

function getAccessToken(item_id, uid, callback) {
    // lookup item in Firebase for access_token
    const itemRef = admin.database().ref('/users/' + uid + '/items/' + item_id)
    itemRef.once('value', (snapshot) => {
      if (snapshot.val() === null) callback({error: "Item not found"})
      callback(null, snapshot.val().access_token)
    })
}


app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
