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
    // handle error
  });
})

app.post('/api/user/get', (req, res) => {
  const userRef = admin.database().ref('users/' + req.body.uid)
  userRef.once('value', (snapshot) => {
    if( snapshot.val() === null ) {
      const usersRef = admin.database().ref('/users')
      const newUser = {
        createdAt: new Date().toUTCString()
        // add display name
      }
      usersRef.child(req.body.uid).set(newUser)
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

      // save item
      const itemRef = admin.database().ref('/users/' + uid + '/items/' + itemId)
      itemRef.set({
        accessToken: accessToken,
        createdAt: new Date().toUTCString()
      })
      res.json({itemId: response.item_id})
    })
    .catch(err => {
      console.log(err)
    })
})

app.post('/api/item/get', (req, res) => {
  getAccessToken(
    req.body.itemId,
    req.body.uid,
    function(err, accessToken) {
      if (err) handleError(err)

      plaidClient.getItem(accessToken, function(err, data) {
        if (err) handleError(err)
        console.log(data)
        res.json({
          item: {
            itemId: null
          }
        })
      })
    }
  )
})

function handleError(err) {
  console.error(err)
  res.status(500)
  res.render('error', { error: err })
}

function getAccessToken(itemId, uid, callback) {
    // lookup item in Firebase for access_token
    const itemRef = admin.database().ref('/users/' + uid + '/items/' + itemId)
    itemRef.once('value', (snapshot) => {
      if (snapshot.val() === null) callback({error: "Item not found"})
      callback(null, snapshot.val().accessToken)
    })
}


app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
