const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path")
const { Configuration, PlaidApi, PlaidEnviroments } = require("plaid");
const app = express();

app.use(
    session({secret: "dogs_are_gods", saveUninitialized: true, resave: true})
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use("/", async (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

app.listen(3000)