import { injectable } from "tsyringe";
import UserRepository from "./UserRepository";
import { UserI } from "./User";
import url from 'url';
import crypto from "crypto";
import nodemailer from 'nodemailer';
import bcrypt from "bcryptjs";

@injectable()
export default class UserService {

    constructor(private userRepository: UserRepository) {
    }

    async getUser(request): Promise<UserI> {
        if (!request.params.id) {
            throw new URIError("id is required");
        }
        try {
            const res = await this.userRepository.getUsers({_id: request.params.id});
            return res[0];
        } catch (err) {
            throw err;
        }
    }

    async getUsers(): Promise<UserI[]> {
        try {
            const users = await this.userRepository.getUsers({});
            console.log(users);
            return users;
        } catch (err) {
            throw err;
        }
    }

    async registerUser(req): Promise<any> {
        //Validation:
        let signature_base64 = req.files.signature.data.toString('base64');
        if (req.body.length === 0 || !req.body) {
            return {message: "No User details sent"};
        } else {
            try {
                const Usr = req.body;
                const usr: UserI = {
                    name: Usr.name,
                    surname: Usr.surname,
                    initials: Usr.initials,
                    email: Usr.email,
                    password: Usr.password,
                    validated: Usr.validated,
                    tokenDate: Usr.tokenDate,
                    validateCode: crypto.randomBytes(64).toString('hex'),
                    signature: Buffer.from(signature_base64) // req.files.signature.data could maybe go straight here
                }
                await this.userRepository.postUser(usr);
                console.log("User posted to database, sending verification email now");
                await this.sendVerificationEmail(usr.validateCode, usr.email );

                return "Successfully created user account";

            } catch (err) {
                throw err;
            }
        }
    }

    async verifyUser(req): Promise<any> {
        const redirect_url = "http://localhost:3000/login-register";
        const queryObject = url.parse(req.url, true).query

        let users = await this.userRepository.getUsers({"email": queryObject["email"]});
        if (users[0].validateCode === queryObject["verificationCode"]) {
            users[0].validated = true;
            await this.userRepository.putUser(users[0]);
            return ('<html>Successfully verified. Click<a href= ' + redirect_url + '> here</a> to return to login</html>');
        } else {
            throw "Validation Codes do not match";
        }
    }

    async sendVerificationEmail(code, emailAddress): Promise<void> {
            let url = process.env.BASE_URL + '/users/verify?verificationCode=' + code + '&email=' + emailAddress;
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
                subject: 'DocumentWorkflow Verification Code',
                html: "<html><p>Hello new DocumentWorkflow User, use this link to activate your account! </p>" +
                    "<a href='" + url + "'>Click here</a></html>"

            };

            console.log(mailOptions);

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    return false;
                } else {
                    console.log('Email sent: ' + info.response);
                    return true;
                }
            });
    }

    async loginUser(req): Promise<any> {
        console.log(req.body); //TODO: delete
        let users = await this.userRepository.getUsers({"email": req.body.email})
        try {
            bcrypt.compare(req.body.password, users[0].password, function (err, result) {
                if (err)
                    throw err;
                if (result) {
                    if (users[0].validated)
                        return "success";
                    else throw "You need to verify your account";
                } else throw "Email or password incorrect";
            });
        } catch (err) {
            throw "Email or password incorrect"
        }
    }

    async deleteUser(request): Promise<{}> {
        const id = request.params.id;
        if (!id) {
            return {message: "No user specified"};
        }
        const usr = await this.userRepository.getUser(id);
        if (!usr) {
            return {message: "User not found"};
        }
        return {user: await this.userRepository.deleteUser(id)};
    }
}

// router.get('/:id', (req,res)=>{
//     User.findById(req.params.id)
//         .then((usr)=>{
//             if(usr){
//                 res.status(200).json({
//                     message: "Success!",
//                     id: usr._id,
//                     name: usr.name,
//                     surname: usr.surname,
//                     email: usr.email
//                 });
//             } else{
//                 res.status(404).json({
//                     message: "User was not found"
//                 });
//             }
//         })
//         .catch((msg)=>{
//             console.log(msg);
//             res.status(500).json({
//                 message: msg
//             });
//         });
// });
//
// function compare(pass,hashed){
//     bcrypt.compare(pass, hashed, (err,match) => {
//         if(err){
//             throw err;
//         } else return match;
//     });
//     return false;
// }
//
// router.post('/login/:id', (req, res) => {
//     //res.json(login_user.handle(req));
//     User.findById(req.params.id)
//         .then((usr)=>{
//             if(usr){
//                 // if(compare(req.body.password, usr.password)){
//                 if(req.body.password === usr.password){
//                     res.status(200).json({
//                         message: "Success!",
//                         token: "generated token"
//                     });
//                 } else {
//                     res.status(401).json({
//                         message: "Unauthorized"
//                     });
//                 }
//             } else{
//                 res.status(404).json({
//                     message: "User was not found"
//                 });
//             }
//         })
//         .catch((msg)=>{
//             console.log(msg);
//             res.status(500).json({
//                 message: msg
//             });
//         });
// });
//
// /**
//  * The api entry point for registering a new user. The request requires the following body parameters be set:
//  *  name: the user's firstname
//  *  surname: the user's surname
//  *  initials the user's initials
//  *  email: the user's email address
//  *  password: the user's password
//  *
//  *  TODO: incorporate the signature to this function.
//  *  TODO: abstract the database functionality to a different file.
//  */
// router.post('', (req, res) => {
//
//     //TODO: Convert password to hash with bcryptjs
//     const user = new User({
//         name: req.body.name,
//         surname: req.body.surname,
//         initials: req.body.initials,
//         email: req.body.email,
//         password: req.body.password,
//     });
//
//     user.save()
//         .then((usr)=>{
//             res.status(200).json({
//                 message: "User added successfully",
//                 userId: usr._id
//             });
//         })
//         .catch((msg)=>{
//             res.status(500).json({
//                 message: msg
//             });
//         });
// });
//
// module.exports = router;

