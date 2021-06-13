const express = require("express");
const User = require("../../schemas/user");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const url = require('url')
const http = require('http')

// "/api/users"

/**
 * This route is used to validate a newly registered user. It takes in one parameter,namely 'verificationCode' which
 * is the automatically generated code used when a new user signs up.
 * NBNB THIS route must appear before the /:id otherwise requests for verify will wrongly be sent to /:id
 * TODO: this get request needs to return some sort of html command to redirect the user to DocumentWorkflow.
 */
router.get('/verify/', (req, res) => {
    const redirect_url = "http://localhost:3000/login-register";
    const queryObject = url.parse(req.url, true).query
    User.find({"email": queryObject["email"]}, function(err, user) {
        if(err)
            res.status(500).json({
                message: "Validation Failed"
            });
        else {
                if(user[0].validateCode === queryObject["verificationCode"])
                {
                    user[0].validated = true;
                    user[0].save();
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write('<html>Successfully verified. Click<a href= ' + redirect_url + '> here</a> to return to login</html>');
                    res.end();
                }
                else {
                    res.writeHead( 401, { 'Content-Type': 'text/html' });
                    res.write('<html>The supplied validation code was incorrect. Contact our support line should this issue persist.</html>');
                    res.end();
                }
        }
    });
});


router.get('/:id', (req,res)=>{
    console.log(req.params);
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

/**
 * This function is the function used to login a user to the Document Workflow website/app. It expects two body
 * parameters, 'email' and 'password'. For now, it just asserts that the hash of the input password corresponds
 * to the hash stored for this user (given that this email address exists in the system).
 * TODO: check that the account is verified
 * TODO: send back a nice response that can be used on frontend.
 */
router.post('/login/', (req, res) => {

    console.log(req.body); //TODO: delete
    User.find({"email": req.body.email}, function(err, user) {
        if(err)
            res.status(500).json({
                message: "Login Failed"
            });
        else {
            if (user[0] !== undefined)
            {
                bcrypt.compare(req.body.password, user[0].password, function (err, result) {
                    if (err)
                        res.status(500).json({
                            message: "Login Failed"
                        });
                    if (result)
                        res.status(200).json({
                            message: "Success!",
                            token: "generated token"
                        });
                    else res.status(401).json({
                        message: "Login Failed"
                    });
                })
             }
            else {
                res.status(401).json({
                    message: "Login Failed"
                })
            }
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
 *  TODO: Check that the signature is a valid filetype!!!!
 *  TODO: Take in a confirm password field here and make sure it matches.
 *  TODO: abstract the database functionality to a different file.
 *  TODO: send verify account email
 *  TODO: fix logic error here (what If we have saved the user but the verification email fails to send?
 */
router.post('', (req, res) => {

    //Data comes in as a buffer, accessible through req.files.signature.data
    //console.log(req.body);
    //console.log(req.body.name);
    //console.log(req.files.signature);
    let signature_base64 = req.files.signature.data.toString('base64');
    //TODO: encrypt signature
    console.log(req.body.name);
    const user = new User({
        name: req.body.name,
        surname: req.body.surname,
        initials: req.body.initials,
        email: req.body.email,
        password: req.body.password,
        signature: Buffer.from(signature_base64),
        validateCode: crypto.randomBytes(64).toString('hex')
    });


    user.save()
        .then((usr) => {
            sendVerificationEmail(user.validateCode, user.email);
            res.status(200).json({
                message: "User added successfully",
                userId: usr._id
            });
        })
        .catch((msg) => {
            console.log(msg);
            res.status(500).json({
                message: msg
            });
        });

});


/**
 * Sends a verification email to the email address associated with a newly created user account.
 * @param code: The verification code associated with the user.
 * @param emailAddress The email address of the user to which the email must be sent.
 * TODO: maybe move email functionality into another file?
 * TODO: include a link for if this email address did not actually want to create a user account.
 */
function sendVerificationEmail(code, emailAddress)
{
    let url = process.env.BASE_URL + '/users/verify?verificationCode=' + code + '&email=' +emailAddress ;
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: emailAddress,
        subject: 'Verification Code',
        html: "<html><p>Hello new DocumentWorkflow User, use this link to activate your account! </p>" +
                "<a href='"+url+"'>Click here</a></html>"

    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            return false;
        } else {
            console.log('Email sent: ' + info.response);
            return true;
        }
    });
}



module.exports = router;