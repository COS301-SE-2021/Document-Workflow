const express = require("express");
const User = require("../../models/user");
const router = express.Router();

// "/api/users"

router.post('/login/:id', (req, res) => {
    //res.json(login_user.handle(req));
    User.findById(req.params.id)
        .then((usr)=>{
            if(usr){
                //check pass: TODO: password hashing comparison
                if(req.body.password === usr.hash){
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
        userName: req.body.userName,
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        hash: req.body.hash,
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