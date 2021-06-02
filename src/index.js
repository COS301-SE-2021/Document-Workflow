const express = require('express');
const bodyParser = require('body-parser');
//const cors = require('cors');

const create_user = require('./services/create_user')
const login_user = require('./services/login_user')

const app = express();
const port = 3000;

//app.use(cors());

//configure body-parser: (Middleware)
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

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
    res.json(create_user.handle(req))
});

app.post('/create_user', (req, res)=> {
    res.json(create_user.handle(req))
});


//-----------------------------Login User---------------------------------------------------------------

app.get('/login_user', (req, res)=> {
    res.json(login_user.handle(req))
});

app.post('/login_user', (req, res)=> {
    res.json(login_user.handle(req))
});


app.listen(port, () => {
    console.log(`Hello world app listening on port ${port}`)
});

