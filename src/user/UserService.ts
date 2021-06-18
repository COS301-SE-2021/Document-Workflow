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
            return jwt.sign({id: id, email: email}, process.env.SECRET, {expiresIn: '15 seconds'});
        } catch (err) {
            throw Error("Email or password incorrect");
        }
    }

    async getUser(request): Promise<UserI> {
        if(!request.params.id){
            throw new URIError("id is required");
        }
        try{
            const res = await this.userRepository.getUsers({_id: request.params.id});
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
    
    async verifyUser(req) : Promise<any>{
        const redirect_url = "http://localhost:3000/login-register";
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

    async loginUser(req): Promise<any> {
        if(!req.body.email || !req.body.password){
            throw new Error("Could not log in");
        }
        let user = await this.userRepository.getUser({"email": req.body.email});
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
        //console.log(req);
        if(req.body.email == null)
            throw "Missing parameter email";
        const users = await this.userRepository.getUsers({email:req.body.email});
        let user = users[0];

        //console.log(user.owned_workflows);
        let workflows = [];
        for(let id of user.owned_workflows)
        {
            workflows.push(await this.workFlowRepository.getWorkFlow(id));
        }

        return {status:"success", data: workflows, message:""};
    }

    async retrieveWorkFlows(req):Promise<any> {
        console.log("Retrieving workflows")
        if(req.body.email == null)
            throw "Missing parameter email";
        const users = await this.userRepository.getUsers({email:req.body.email});
        let user = users[0];

        let workflows = [];
        for(let id of user.workflows)
        {
            workflows.push(await this.workFlowRepository.getWorkFlow(id));
        }

        return {status:"success", data: workflows, message:""};
    }


}

