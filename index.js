const express = require('express')
const app = express()
const admin = require('firebase-admin')

const PORT = process.env.PORT || 8000

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://beam-94bf1-default-rtdb.firebaseio.com/'
});

app.use(express.static(__dirname + '/public'))

// parse request bodies (req.body)
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.sendFile('views/index.html', { root: __dirname })
})

app.get('/profile', (req, res) => {
  res.sendFile('views/profile.html', { root: __dirname })
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
