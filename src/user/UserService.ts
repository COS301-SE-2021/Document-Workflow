import { injectable } from "tsyringe";
import UserRepository from "./UserRepository";
import { UserProps} from "./User"; //, Token } from "./User";
import nodemailer from 'nodemailer';
import jwt from "jsonwebtoken";
import { AuthenticationError, RequestError } from "../error/Error";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { isStrongPassword, isEmail } from "validator";
import {logger} from "../LoggingConfig";

@injectable()
export default class UserService {
    constructor(private userRepository: UserRepository) {}
    async authenticateUser(password, usr: UserProps) {
        const result = await bcrypt.compare(password, await usr.password);
        if(result){
            return this.generateToken(usr.email, usr._id);
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

    generateToken(email, id): string{
        return jwt.sign({id: id, email: email}, process.env.SECRET, {expiresIn: "24h"});
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

    async getUserById(_id): Promise<UserProps> {
        if(_id === undefined){
            throw new Error("Search criteria required");
        }
        try {
            return await this.userRepository.findUser({_id: _id});
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

        if(!isEmail(req.body.email)){
            throw new RequestError("The given email address is invalid.");
        }

        const checkForUser = await this.getUserByEmail(req.body.email);
        if(checkForUser){
            throw new RequestError("The given email address already has a Document Workflow Account");
        }

        if(req.body.password !== req.body.confirmPassword){
            throw new RequestError("The two passwords do not match.");
        }

        if(!isStrongPassword(req.body.password)){
            throw new RequestError("Password is not strong enough. Ensure that it is at least 8 characters long with one uppercase character, lowercase character, number and special character");
        }

        const usr: UserProps = req.body;
        usr.signature = req.files.signature.data;
        usr.validateCode = crypto.randomBytes(64).toString('hex');
        usr.password = await this.getHashedPassword(usr.password);
        usr.ownedWorkflows = [];
        usr.workflows = [];
        usr.workflowTemplates = [];
        const tempValidateCode = usr.validateCode;
        //const user: UserProps = await this.userRepository.postUser(usr);
        //const token: Token = { token: await this.generateToken(usr.email, usr._id), __v: 0};
        //usr.tokens = [token];
        const user: UserProps = await this.userRepository.saveUser(usr);
        //const response = await this.userRepository.putUser(usr);
        if(user){
            //logger.info(usr); It seems as though the usr object gets changed after it is saved to the database
            logger.info(req.body.email + " " + tempValidateCode);
            await this.sendVerificationEmail(req.body.email, tempValidateCode);//,
            return user;
        }

    }


    async verifyUser(req): Promise<any> {
        const redirect_url = process.env.REDIRECT_URL; 
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
            throw new AuthenticationError("Could not Validate User Account");
        }
    }

    async sendVerificationEmail(emailAddress, code ): Promise<void> {
        logger.info("Sending an email to the new email address");
        let url = process.env.BASE_URL + '/users/verify?verificationCode=' + code + '&email=' + emailAddress;
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD
            },
            tls:{ rejectUnauthorized:false} 
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
            throw new RequestError("Please supply an email and a password");
        }
        const user = await this.userRepository.findUser({"email": req.body.email});
        if(!user)
            throw new AuthenticationError("The entered email or password was incorrect");

        if(user.validated){
            try{
                return await this.authenticateUser(req.body.password, user);
            }
            catch(err){
                throw new AuthenticationError("The entered email or password was incorrect");
            }
        } else {
            throw new AuthenticationError("Please check your emails and validate your account.");
        }
    }

    async logoutUser(req): Promise<UserProps> {
        if(!req.user){
            throw new RequestError("Missing required properties");
        }
        const user = await this.userRepository.findUser({email: req.user.email});
        //const tokens: Token[] = req.user.tokens;
        //tokens.filter(token => {return token.token !== req.user.token});
        //user.tokens = tokens as any;
        try {
            return await this.userRepository.updateUser(user);
        }
        catch(err){
            console.error(err);
            throw new RequestError("Could not log out user");
        }
    }

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
                //workflows: user.workflows
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

    async getWorkflowTemplatesIds(user) {
        const usr = await this.getUserById(user._id);
        return {status:"success", data:{templateIds: usr.workflowTemplates}, message:""};
    }
}
