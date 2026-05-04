const express = require('express');
const rotasEmail = require('./routes/rotasEmail');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.options('*', cors());
app.use('/email', rotasEmail);

module.exports = app;