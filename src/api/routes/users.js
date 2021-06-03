const express = require("express");
const User = require("../../models/user");
const router = express.Router();
const create_user = require('./services/create_user');
const login_user = require('./services/login_user');

//All of the routes for users:

router.post('/login', (req, res)=> {
    res.json(login_user.handle(req));
});

router.post('', (req, res)=> {
    res.json(create_user.handle(req));
});

module.exports = router;