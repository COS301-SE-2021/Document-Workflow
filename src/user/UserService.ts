import { injectable } from "tsyringe";
import UserRepository from "./UserRepository";
import { UserProps, Token } from "./User";
import nodemailer from 'nodemailer';
import jwt from "jsonwebtoken";
import AuthenticationError from "../error/AuthenticationError";
import RequestError from "../error/RequestError";
import bcrypt from "bcrypt";
import crypto from "crypto";
import WorkFlowRepository from "../workflow/WorkFlowRepository";

@injectable()
export default class UserService {
    constructor(private userRepository: UserRepository, private workFlowRepository: WorkFlowRepository) {}
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
        return jwt.sign({id: id, email: email}, process.env.SECRET, {expiresIn: "1 hour"});
    }

    async getUser(request): Promise<UserProps> {
        if(!request.params){
            throw new RequestError("Search criteria required");
        }
        try {
            return await this.userRepository.getUser(request.params);
        } catch (err) {
            console.error(err);
            throw new RequestError("Could not get user");
        }
    }

    async getUserById(request): Promise<UserProps> {
        if(!request.params.id){
            throw new Error("Search criteria required");
        }
        try {
            return await this.userRepository.getUser({id: request.params.id});
        } catch (err) {
            console.error(err);
            throw new RequestError("Could not get user");
        }
    }

    async getUserByEmail(request): Promise<UserProps> {
        if(!request.params.email){
            throw new Error("Search criteria required");
        }
        try {
            return await this.userRepository.getUser({email: request.params.email});
        } catch (err) {
            console.error(err);
            throw new RequestError("Could not get user");
        }
    }

    async getAllUsers(): Promise<UserProps[]> {
        try {
            return await this.userRepository.getUsers({});
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
            //const user: UserProps = await this.userRepository.postUser(usr);
            const token: Token = { token: await this.generateToken(usr.email, usr._id), __v: 0};
            usr.tokens = [token];
            const user: UserProps = await this.userRepository.postUser(usr);
            //const response = await this.userRepository.putUser(usr);
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

        const user = await this.userRepository.getUser({"email": query.email});
        if (user && user.validateCode === query.verificationCode) {
            user.validated = true;
            await this.userRepository.putUser(user);
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

    async loginUser(req): Promise<any> {
        if(!req.body.email || !req.body.password){
            throw new Error("Could not log in");
        }
        const user = await this.userRepository.getUser({"email": req.body.email});
        if(user.validated){
            try{
                return await this.authenticateUser(req.body.password, user);
            }
            catch(err){
                throw new AuthenticationError(err.message);
            }
        } else {
            throw new AuthenticationError("User must be validated");
        }
    }

    async logoutUser(req): Promise<UserProps> {
        if(!req.user){
            throw new RequestError("Missing required properties");
        }
        const user = await this.userRepository.getUser({email: req.user.email});
        const tokens: Token[] = req.user.tokens;
        tokens.filter(token => {return token.token !== req.user.token});
        user.tokens = tokens as any;
        try {
            return await this.userRepository.putUser(user);
        }
        catch(err){
            console.error(err);
            throw new RequestError("Could not log out user");
        }
    }

    async retrieveOwnedWorkFlows(req): Promise<any> {
        console.log("Retrieving owned workflows")
        const user = await this.userRepository.getUser({email: req.user.email});

        let workflows = [];
        for(let id of user.owned_workflows)
        {
            workflows.push(await this.workFlowRepository.getWorkFlow(id));
        }

        return {status:"success", data: workflows, message:""};
    }

    async retrieveWorkFlows(req):Promise<any> {
        console.log("Retrieving workflows")

        const user = await this.userRepository.getUser({email: req.user.email});

        let workflows = [];
        for(let id of user.workflows)
        {
            workflows.push(await this.workFlowRepository.getWorkFlow(id));
        }

        return {status:"success", data: workflows, message:""};
    }

    async deleteUser(req): Promise<UserProps> {
        if (!req.params.id) {
            throw new RequestError("Missing Parameter");
        }
        if(!await this.userRepository.getUser(req.params.id)){
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
            let user = await this.userRepository.getUser({email: req.user.email});
            const data = {
                name: user.name,
                surname: user.surname,
                initials: user.initials,
                email: user.email,
                signature:user.signature.toString(),
                owned_workflows: user.owned_workflows,
                workflows: user.workflows
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
        if(!await this.userRepository.getUser({_id: req.params.id})){
            throw new RequestError("User does not exist");
        }
        try{
            return await this.userRepository.putUser(req.body);
        }
        catch(err){
            console.error(err);
            throw new RequestError("Could not update User");
        }

    }
}
