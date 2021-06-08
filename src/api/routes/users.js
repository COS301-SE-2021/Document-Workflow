const express = require("express");
const User = require("../../schemas/user");
const router = express.Router();
const bcrypt = require("bcryptjs");
const fs = require('fs')

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

    User.findById(req.params.id)
        .then((usr)=>{
            if(usr){
                // if(compare(req.body.password, usr.password)){
                if(req.body.password === usr.password){
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

router.post('/login/', (req, res) => {

    User.find({"email": req.body.email}, function(err, user) {
        if(err)
            res.status(500).json({
                message: "Login Failed"
            });
        else {
            bcrypt.compare(req.body.password, user[0].password, function(err, result)
            {
                if(err)
                    res.status(500).json({
                        message: "Login Failed"
                    });
                if(result)
                    res.status(200).json({
                        message: "Success!",
                        token: "generated token"
                    });
                else res.status(401).json({
                    message: "Login Failed"
                });
            })
        }
    });

});

/**
 * The api entry point for registering a new user. The request requires the following body parameters be set:
 *  name: the user's firstname
 *  surname: the user's surname
 *  initials the user's initials
 *  email: the user's email address
 *  password: the user's password
 *
 *  TODO: incorporate the signature to this function.
 *  TODO: abstract the database functionality to a different file.
 */
router.post('', (req, res) => {

    //Data comes in as a buffer, accessible through req.files.signature.data
    console.log(req.files.signature);
    let signature_base64 = req.files.signature.data.toString('base64');
    //TODO: encrypt signature
    console.log(req.body.name);
    const user = new User({
        name: req.body.name,
        surname: req.body.surname,
        initials: req.body.initials,
        email: req.body.email,
        password: req.body.password,
        signature: Buffer.from(signature_base64)
    });

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

function encryptSignature(signature_base64)
{

}

function decryptSignature(signature_base64)
{

}



module.exports = router;