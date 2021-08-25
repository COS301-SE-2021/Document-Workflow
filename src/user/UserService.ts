import { injectable } from "tsyringe";
import UserRepository from "./UserRepository";
import { UserI } from "./User";
import url from 'url';
import crypto from "crypto";
import nodemailer from 'nodemailer';
import bcrypt from "bcryptjs";
import WorkFlowRepository from "../workflow/WorkFlowRepository";
import jwt from "jsonwebtoken";

@injectable()
export default class UserService {

    constructor(private userRepository: UserRepository, private workFlowRepository: WorkFlowRepository) {
    }

    async authenticateUser(email, password, id, hash){
        try {
            let result = await bcrypt.compare(password, hash);
            if (!result) {
                throw "Email or password incorrect";
            }
            return jwt.sign({_id: id, email: email}, process.env.SECRET, {expiresIn: '24h'});
        } catch (err) {
            throw Error("Email or password incorrect");
        }
    }

    async getUser(request): Promise<UserI> {
        if(!request._id){
            throw new URIError("id is required");
        }
        try{
            const res = await this.userRepository.getUsers({_id: request._id});
            return res[0];
        }catch(err) {
            throw err;
        }
    }

    async getUserById(request): Promise<UserI> {
        if(!request.params.id){
            throw new Error("Search criteria required");
        }
        try {
            return await this.userRepository.getUser({id: request.params.id});
        } catch (err) {
            throw err;
        }
    }

    async getUserByEmail(request): Promise<UserI> {
        if(!request.params.email){
            throw new Error("Search criteria required");
        }
        try {
            return await this.userRepository.getUser({email: request.params.email});
        } catch (err) {
            throw err;
        }
    }

    async getAllUsers(): Promise<UserI[]> {
        try {
            const users = await this.userRepository.getUsers({});
            console.log(users);
            return users;
        } catch (err) {
            throw err;
        }
    }

    async getUsers(): Promise<UserI[]> {
        try{
            const users = await this.userRepository.getUsers({});
            console.log(users);
            return users;
        }catch(err){
            throw err;
        }
    }

    /**
     * The function responsible for creating a new user and adding their information to the DocumentWorkflow system.
     * @param req
     */
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
                    password: this.validatePassword(Usr.password),
                    validated: Usr.validated,
                    tokenDate: Usr.tokenDate,
                    validateCode: crypto.randomBytes(64).toString('hex'),
                    signature: Buffer.from(signature_base64), // req.files.signature.data could maybe go straight here
                    owned_workflows: [],
                    workflows: []
                }
                await this.userRepository.postUser(usr);
                await this.sendVerificationEmail(usr.validateCode, usr.email );
                return {status:'success', data:{}, message:"Successfully created user account"};

            } catch (err) {
                throw err;
            }
        }
    }

    /**
     * A function that verifies whether or not the password associated with a new user account is strong enough.
     * It exists simply to fzcilitate error handling, since the schema for the user contains ths validator as well.
     * A password must be at least 8 characters long, contain an uppercase letter, lowercase letter, number and special symbol.
     * @param password
     * @private
     */
    private validatePassword(password): string{
        if(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(password))
            return password;
        else throw {status: "failed", data: {}, message:"Password is not strong enough"};
    }

    /**
     * Validates a user by comparing request verification code with that stored in the corresponding user. The incoming request
     * is a get request, hence the need for url.parse.
     * @param req
     * TODO: need to have more elegant returned html.
     * TODO: need a better system for the redirect_html.
     */
    async verifyUser(req) : Promise<any>{
        const redirect_url = "http://localhost:8100/login-register";
        const queryObject = url.parse(req.url, true).query

        let users = await this.userRepository.getUsers({"email": queryObject["email"]});
        if(users[0].validateCode === queryObject["verificationCode"])
        {
            users[0].validated = true;
            await this.userRepository.putUser(users[0]);
            return ('<html>Successfully verified. Click<a href= ' + redirect_url + '> here</a> to return to login</html>');
        }
        else {
            throw "Validation Codes do not match";
        }
    }

    /**
     * This functiona handles the process of sending the email to a user that they can use to verify that they wish to
     * create an account on the DocumentWorkflow system. Makes use
     * @param code: the randomly generated code needed to validate the user.
     * @param emailAddress: the email address associated with the user to which the email is sent.
     * TODO: will need to handle any errors as a result of emails not being sent.
     */
    async sendVerificationEmail(code, emailAddress): Promise<void> {
        function sendVerificationEmail(code, emailAddress) {
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
        } sendVerificationEmail(code, emailAddress);
    }

    /**
     * The function that handles the logic of logging in a user. It expects the given request to contain
     * an email and a password field. It checks if the email is associated with any stored user and if the user
     * has validated their account using the email verification functionality. For security reasons, we throw a
     * 'Email or password incorrect' error if either the user does not exist or the password is incorrect.
     * @param req: the HTTP request and all associated data.
     */
    async loginUser(req): Promise<any> {
        if(!req.body.email || !req.body.password){
            throw new Error("Could not log in");
        }
        let user = await this.userRepository.getUser({"email": req.body.email});
        console.log(user);
        if(user == null)
            throw new Error("Email or password incorrect");
        if(user.validated){
            return await this.authenticateUser(user.email, req.body.password, user._id, user.password);
        } else {
            throw new Error("User must be validated");
        }
    }

    async deleteUser(request): Promise<{}> {
        const id = request.params.id;
        if(!id){
            return { message: "No user specified" };
        }
        const usr = await this.userRepository.getUser(id);
        if(!usr){
            return { message: "User not found" };
        }
        return { user: await this.userRepository.deleteUser(id) };
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

    encryptSignature(buffer){
        let cipher,
            result,
            iv;

        iv = crypto.randomBytes(16);
        cipher = crypto.createCipheriv(process.env.ALGORITHM,process.env.SECRET, iv);
        result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);

        return result;
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

    /**
     * This function will handle the first part of resetting the password for a user account. We need to prevent CSRF attacks from being possible, thus this
     * function will be used to generate anti CSRF tokens. Either that or we will send an email to the user's account. Either way, we will probably need CSRF
     * tokens at some point.
     * @param req
     * TODO: research CSRF attacks and how to better prevent them.
     */
    async generatePasswordReset(req) {
        return Promise.resolve(undefined);
    }
}

