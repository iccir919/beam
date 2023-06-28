require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const APP_PORT = process.env.APP_PORT || 8000;

/**
 * Initialization!
 */

// Set up the server

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("./public"));


const server = app.listen(APP_PORT, function() {
    console.log(`Server is up and running at http://localhost:${APP_PORT}/`);
});

const usersRouter = require("./routes/users");

app.use("/server/users", usersRouter);

/* Add in some basic error handling so server doesn't crash if
 * it runs into an error
 */

const errorHandler = function(err, req, res, next) {
    console.error(`Your error:`);
    console.error(err);
    if (err.response?.data != null) {
        res.status(500).send(err.response.data)
    } else {
        res.status(500).send({
            error_code: "OTHER_ERROR",
            error_message: "I got some other message on the server"
        });
    }
};
app.use(errorHandler);