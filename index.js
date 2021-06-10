const express = require('express')
const app = express()
const PORT = process.env.PORT || 8000;

app.use(express.static(__dirname + '/public'))

// parse request bodies (req.body)
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.sendFile('views/index.html', { root: __dirname })
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
