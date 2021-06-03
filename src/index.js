const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const userRoute = require("./api/routes/users");

const app = express();

mongoose.connect(process.env.MONGO_PROD_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then(()=>{
        console.log('Connected to database!');
    })
    .catch((message)=>{
        console.log('Connection failed!\n' + message + '\n');
    });

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, DELETE, PUT, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
    //res.setHeader('Access-Control-Allow-Credentials', 'bearer');
    next();
});

app.use("/api/users", userRoute);
module.exports = app;

