import { injectable } from "tsyringe";
import UserRepository from "./UserRepository";
import User from "./User";
import nodemailer from 'nodemailer';
import jwt from "jsonwebtoken";
import AuthenticationError from "../error/AuthenticationError";
import RequestError from "../error/RequestError";
import bcrypt from "bcrypt";

@injectable()
export default class UserService {
    constructor(private userRepository: UserRepository) {}

    async authenticateUser(password, hash, id) {
        bcrypt.compare(password, hash)
            .then((result) =>{
                if(result) return jwt.sign({id: id}, process.env.SECRET, {expiresIn: '15 seconds'});
                else throw new AuthenticationError("Password or Email Incorrect");
            })
            .catch((err) => {
                throw err;
            });
    }

    async getUser(request): Promise<User> {
        if(!request.params){
            throw new Error("Search criteria required");
        }
        try {
            return await this.userRepository.getUser(request.params);
        } catch (err) {
            throw err;
        }
    }

    async getUserById(request): Promise<User> {
        if(!request.params.id){
            throw new Error("Search criteria required");
        }
        try {
            return await this.userRepository.getUser({id: request.params.id});
        } catch (err) {
            throw err;
        }
    }

    async getUserByEmail(request): Promise<User> {
        if(!request.params.email){
            throw new Error("Search criteria required");
        }
        try {
            return await this.userRepository.getUser({email: request.params.email});
        } catch (err) {
            throw err;
        }
    }

    async getAllUsers(): Promise<User[]> {
        try {
            return await this.userRepository.getUsers({});
        } catch (err) {
            throw err;
        }
    }

    async registerUser(req): Promise<User> {
        if (req.body.length === 0 || !req.body || !req.files.signature.data) {
            throw {message: "Missing required information to register user"};
        }
        try {
            const usr: User = req.body;
            const response = await this.userRepository.postUser(usr);
            if(response){
                const hash = response.password;
                await Promise.all([
                    this.sendVerificationEmail(usr.email, usr.validateCode),
                    this.authenticateUser(usr.password, hash, response._id)
                ]);
                return response;
            }
        } catch (err) {
            throw err;
        }
    }

    async verifyUser(req): Promise<any> {
        const redirect_url = "http://localhost:3000/login-register";
        if(!req.query.email || !req.query.verificationCode){
            throw "Missing required query";
        }
        const query = req.query;

        let user = await this.userRepository.getUser({"email": query.email});
        if (user.validateCode === query.verificationCode) {
            user.validated = true;
            await this.userRepository.putUser(user);
            return ('<html lang="en">Successfully verified. Click<a href= ' + redirect_url + '> here</a> to return to login</html>');
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
            html: "<html lang='en'><p>Hello new DocumentWorkflow User, use this link to activate your account! </p>" +
                "<a href='" + url + "'>Click here</a></html>"

        };

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
        if(!req.body.email || !req.body.password){
            throw new Error("Could not log in");
        }
        let user = await this.userRepository.getUser({"email": req.body.email})
        if(user.validated){
            return await this.authenticateUser(req.body.password, user.password, user._id);
        } else {
            throw new AuthenticationError("User must be validated");
        }
    }

    async logoutUser(req): Promise<User> {
        if(!req.user.tokens || !req.token){
            throw new RequestError("Missing required properties");
        }
        //Delete current token in usage from user:
        req.user.tokens = req.user.tokens.filter(token => {return token.token !== req.token});
        return await req.user.save();
    }

    async deleteUser(req): Promise<User> {
        if (!req.params.id) {
            throw new RequestError("Missing Parameter");
        }
        if(!await this.userRepository.getUser(req.params.id)){
            throw new RequestError("User does not exist");
        }
        return await this.userRepository.deleteUser(req.params.id);
    }

    async updateUser(req): Promise<User> {
        if(!req.body || !req.params.id){
            throw new RequestError("Missing Parameters");
        }
        if(!await this.userRepository.getUser({_id: req.params.id})){
            throw new RequestError("User does not exist");
        }
        return await this.userRepository.putUser(req.body);
    }
}
