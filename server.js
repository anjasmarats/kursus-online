const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static('public'));

module.exports = {
    app
};