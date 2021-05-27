const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

//let books = [];

 app.use(cors());

//configure body-parser:
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/book', (req,res) => {
    const book = req.body;
    console.log(book);

    res.send('Book added to database');
})

app.get('/', (req,res) => {
    res.send('Hello world, from express');
});

app.get('/new-book', (req,res) => {
    res.sendFile('book.html', {root: __dirname})
});

app.get('/node_modules/bootstrap/dist/css/bootstrap.css', ((req, res) => {
    res.sendFile('node_modules/bootstrap/dist/css/bootstrap.css', {root: __dirname})
}));

app.listen(port, () => {
    console.log(`Hello world app listening on port ${port}`)
});

