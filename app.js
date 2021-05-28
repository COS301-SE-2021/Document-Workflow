const express = require('express');
const bodyParser = require('body-parser');
//const cors = require('cors');

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
    books.push(book);
    res.send('Book added to database');
})

app.get('/', (req,res) => {
    res.send('Hello world, from express');
});

app.listen(port, () => {
    console.log(`Hello world app listening on port ${port}`)
});

