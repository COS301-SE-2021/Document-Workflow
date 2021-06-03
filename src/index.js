const express = require('express');
const bodyParser = require('body-parser');
//const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const create_user = require('./services/create_user');
const login_user = require('./services/login_user');

const app = express();
//const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_PROD_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then(()=>{
        console.log('Connected to database!');
    })
    .catch((message)=>{
        console.log('Connection failed!\n' + message + '\n');
    });

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//app.use(cors);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, DELETE, PUT, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
    //res.setHeader('Access-Control-Allow-Credentials', 'bearer');
    next();
});

//Accepting anything, must validate:
app.post('/book', (req,res) => {
    const book = req.body;
    console.log(book);
    //books.push(book);
    res.send('Book added to database');
})

app.get('/', (req,res) => {
    res.send('Hello world, from express');
});

//----------------------------Create User-----------------------------------------------

//TODO: should be a post request only, we dont want to send passwords as plaintext
app.get('/create_user', (req, res)=> {
    res.header("Access-Control-Allow-Origin", "*");
    res.json(create_user.handle(req))
});

app.post('/create_user', (req, res)=> {
    res.header("Access-Control-Allow-Origin", "*");
    res.json(create_user.handle(req))
});


//-----------------------------Login User---------------------------------------------------------------

app.get('/login_user', (req, res)=> {
    res.json(login_user.handle(req))
});

app.post('/login_user', (req, res)=> {
    res.json(login_user.handle(req))
});

