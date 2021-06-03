const express = require("express");
const User = require("../../models/user");
const router = express.Router();
const bcrypt = require("bcryptjs");
const saltRounds = process.env.SALT_ROUNDS;

// "/api/users"

router.get('/:id', (req,res)=>{
    User.findById(req.params.id)
        .then((usr)=>{
            if(usr){
                res.status(200).json({
                    message: "Success!",
                    id: usr._id,
                    name: usr.name,
                    surname: usr.surname,
                    email: usr.email
                });
            } else{
                res.status(404).json({
                    message: "User was not found"
                });
            }
        })
        .catch((msg)=>{
            console.log(msg);
            res.status(500).json({
                message: msg
            });
        });
});

function compare(pass,hashed){
    bcrypt.compare(pass, hashed, (err,match) => {
        if(err){
            throw err;
        } else return match;
    });
    return false;
}

router.post('/login/:id', (req, res) => {
    //res.json(login_user.handle(req));
    User.findById(req.params.id)
        .then((usr)=>{
            if(usr){
                if(compare(req.body.password, usr.password)){
                    res.status(200).json({
                        message: "Success!",
                        token: "generated token"
                    });
                } else {
                    res.status(401).json({
                        message: "Unauthorized"
                    });
                }
            } else{
                res.status(404).json({
                    message: "User was not found"
                });
            }
        })
        .catch((msg)=>{
            console.log(msg);
            res.status(500).json({
                message: msg
            });
        });
});

router.post('', (req, res) => {
    //res.json(create_user.handle(req));
    //TODO: Convert password to hash with bcryptjs
    const user = new User({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone
    });
    console.log(user);
    user.save()
        .then((usr)=>{
            res.status(200).json({
                message: "User added successfully",
                userId: usr._id
            });
        })
        .catch((msg)=>{
            res.status(500).json({
                message: msg
            });
        });
});

module.exports = router;