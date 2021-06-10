const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'))

// parse request bodies (req.body)
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.sendFile('views/index.html', { root: __dirname })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
