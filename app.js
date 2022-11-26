const express = require('express');
const app = express();

let port = process.env.PORT;
if (port == null || port == '') {
    port = 3000;
}

app.get('/', (req, res) => {
    res.send('Beam - Illuminate Your Finances');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})