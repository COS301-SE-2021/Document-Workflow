import { injectable } from "tsyringe";
import UserRepository from "./UserRepository";
import { UserProps } from "./User";
import nodemailer from 'nodemailer';
import jwt, { Jwt } from "jsonwebtoken";
import { AuthenticationError, RequestError } from "../error/Error";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Database from "../Database";

@injectable()
export default class UserService {

    constructor(private userRepository: UserRepository) {}
    async authenticateUser(password, usr: UserProps): Promise<String> {
        const result = await bcrypt.compare(password, await usr.password);
        if(result){
            return this.generateToken(usr.email, usr._id);
            /*const user: UserDoc = await this.userRepository.findUser(usr.email);
            user.tokens.push(token);
            await this.userRepository.updateUser(user);*/
        }else{
            throw new AuthenticationError("Password or Email is incorrect");
        }
    }

    async getHashedPassword(password: string){
        return await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS))
            .then(function(hash){
                return hash;
            })
            .catch(err => {
                throw new Error(err);
            });
    }

    async generateToken(email, id): Promise<String>{
        return jwt.sign({id: id, email: email}, process.env.SECRET, {expiresIn: "1h"});
    }

    //TODO: check that its safe to save a user the way we are saving them here. We arent creating an entirely new
    //User since we do pass through a valid id, but should probably use an updateOne function in the
    //User repository to be safe.
    async updateUserWorkflows(user){
        await this.userRepository.saveUser(user);
    }

    async getUser(request): Promise<UserProps> {
        if(request === undefined){
            throw new RequestError("Search criteria required");
        }
        try {
            return await this.userRepository.findUser(request.params);
        } catch (err) {
            console.error(err);
            throw new RequestError("Could not get user");
        }
    }

    async getUserById(id): Promise<UserProps> {
        if(id === undefined){
            throw new Error("Search criteria required");
        }
        try {
            return await this.userRepository.findUser({_id: id});
        } catch (err) {
            console.error(err);
            throw new RequestError("Could not get user");
        }
    }

    async getUserByEmail(email): Promise<UserProps> {
        if(email === undefined){
            throw new Error("Search criteria required");
        }
        try {
            return await this.userRepository.findUser({email: email});
        } catch (err) {
            console.error(err);
            throw new RequestError("Could not get user");
        }
    }

    async getAllUsers(): Promise<UserProps[]> {
        try {
            return await this.userRepository.findUsers({});
        } catch (err) {
            console.error(err);
            throw new RequestError("Could not get users");
        }
    }

    async registerUser(req): Promise<UserProps> {
        if (req.body.length === 0 || !req.body || !req.files.signature.data) {
            throw new RequestError("Missing required information to register user");
        }
        try {
            const usr: UserProps = req.body;
            usr.signature = req.files.signature.data;
            usr.validateCode = crypto.randomBytes(64).toString('hex');
            usr.password = await this.getHashedPassword(usr.password);

            /*const token: Token = { token: await this.generateToken(usr.email, usr._id), __v: 0};
            usr.tokens = [token];*/

            const user: UserProps = await this.userRepository.saveUser(usr);
            if(user){
                await this.sendVerificationEmail(usr.email, usr.validateCode)//,
                return user;
            }
        } catch (err) {
            console.error(err);
            throw new RequestError("Could not register user");
        }
    }

    async verifyUser(req): Promise<any> {
        const redirect_url = "http://localhost:3000/login-register";
        if(!req.query.email || !req.query.verificationCode){
            throw new RequestError("Missing required properties");
        }
        const query = req.query;

        const user = await this.userRepository.findUser({"email": query.email});
        if (user && user.validateCode === query.verificationCode) {
            user.validated = true;
            await this.userRepository.updateUser(user);
            return ('<html lang="en">Successfully verified. Click<a href= ' + redirect_url + '> here</a> to return to login</html>');
        } else {
            throw new AuthenticationError("Could not Validate User Email");
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

    async loginUser(email, password): Promise<String> {

        let user;
        try{
            user = await this.userRepository.findUser({email: email});
        } catch(err){
            throw err;
        }

        if(user && user.validated){
            try{
                return await this.authenticateUser(password, user);
            }
            catch(err){
                throw new AuthenticationError(err.message);
            }
        } else {
            throw new RequestError("User does not exist");
        }
    }

    async logoutUser(token: Jwt): Promise<Boolean> {
        try {
            return await Database.addToBlacklist(token);
        }
        catch(err){
            console.error(err);
            throw new RequestError("Could not log out user");
        }
    }

    //TODO: Delete User from workflows and phases.
    async deleteUser(req): Promise<UserProps> {
        if (!req.params.id) {
            throw new RequestError("Missing Parameter");
        }
        if(!await this.userRepository.findUser(req.params.id)){
            throw new RequestError("User does not exist");
        }
        try{
            return await this.userRepository.deleteUser(req.params.id);
        }
        catch(err){
            console.error(err);
            throw new RequestError("Could not remove user");
        }

    }

    encryptSignature(buffer){
        let cipher,
            result,
            iv;

        iv = crypto.randomBytes(16);
        cipher = crypto.createCipheriv(process.env.ALGORITHM,process.env.SECRET, iv);
        result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);

        return result;
    }

    async getUserDetails(req) {
        try{
            let user = await this.userRepository.findUser({email: req.user.email});
            const data = {
                name: user.name,
                surname: user.surname,
                initials: user.initials,
                email: user.email,
                signature:user.signature.toString()
                //ownedWorkflows: user.ownedWorkflows,
               // workflows: user.workflows
            };
            return {status: "success", data: data, message:""};
        }
        catch(err){
            console.log(err);
            throw "Could not fetch user details";
        }
    }

    decryptSignature(buffer){
        let decipher,
            result,
            iv;

        iv = buffer.slice(0, 16);

        buffer = buffer.slice(16);
        decipher = crypto.createDecipheriv(process.env.ALGORITHM,process.env.SECRET, iv);
        result = Buffer.concat([decipher.update(buffer), decipher.final()]);

        return result;
    }

    async updateUser(req): Promise<UserProps> {
        if(!req.body || !req.params.id){
            throw new RequestError("Missing Parameters");
        }
        if(!await this.userRepository.findUser({_id: req.params.id})){
            throw new RequestError("User does not exist");
        }
        try{
            return await this.userRepository.updateUser(req.body);
        }
        catch(err){
            console.error(err);
            throw new RequestError("Could not update User");
        }

    }

    async verifyEmailExistence(email, requestingUserId) {
        return Promise.resolve(undefined);
    }
}
