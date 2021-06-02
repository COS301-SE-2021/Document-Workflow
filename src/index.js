const express = require('express');
const bodyParser = require('body-parser');
//const cors = require('cors');

const create_user = require('./services/create_user')

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

//TODO: decide if this will be a get and post request or just a post request
app.get('/create_user', (req, res)=> {

});

app.post('/create_user', (req, res)=> {

});





app.listen(port, () => {
    console.log(`Hello world app listening on port ${port}`)
});

