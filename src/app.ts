require('dotenv').config();

const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const routes = require('./routes/routes');
app.use('/api', routes)

const port = process.env.API_PORT || 8081;


var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("NFT Marketplace API listening at http://%s:%s", host, port);
});
