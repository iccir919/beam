const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Welcome to Beam, a light on your past finances')
})

app.listen(port, () => {
    console.log(`Beam is listening at http://localhost:${port}`)
})