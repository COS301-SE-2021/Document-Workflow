import { injectable } from "tsyringe";
import UserRepository from "./UserRepository";
import nodemailer from 'nodemailer';
import jwt, { Jwt } from "jsonwebtoken";
import { AuthenticationError, RequestError, ServerError } from "../error/Error";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { isStrongPassword, isEmail } from "validator";
import {logger} from "../LoggingConfig";
import { Types } from "mongoose";
import { IUser, privilegeLevel } from "./IUser";
import { Blacklist } from "../security/Blacklist";
type ObjectId = Types.ObjectId;

@injectable()
export default class UserService {
    constructor(private userRepository: UserRepository) {

    }

    async authenticateUser(password, usr: IUser): Promise<String> {
        const result = await bcrypt.compare(password, usr.password);
        if(result){
            return this.generateToken(usr.email, usr._id, usr.privilegeLevel);
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
                throw new Error(err.message);
            });
    }

    async generateToken(email, id, privilege): Promise<String>{
        return jwt.sign({id: id, email: email, privilege: privilege}, process.env.SECRET, {expiresIn: "1h"});
    }

    async updateUserWorkflows(user: IUser){
        await this.userRepository.updateUser(user);
    }

    async getUser(request): Promise<IUser> {
        if(request === undefined){
            throw new RequestError("Search criteria required");
        }
        try {
            return await this.userRepository.findUser(request.params);
        } catch (err) {
            throw err;
        }
    }

    async getUserById(id): Promise<IUser> {
        if(id === undefined){
            throw new Error("Search criteria required");
        }
        try {
            return await this.userRepository.findUser({_id: id});
        } catch (err) {
            throw err;
        }
    }

    async getUserByEmail(email): Promise<IUser> {
        if(email === undefined){
            throw new Error("Search criteria required");
        }
        try {
            return await this.userRepository.findUser({email: email});
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async getAllUsers(): Promise<IUser[]> {
        try {
            return await this.userRepository.findUsers({});
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async registerUser(req): Promise<IUser> {
        if (req.body.length === 0 || !req.body || !req.files.signature.data) {
            throw new RequestError("Missing required information to register user");
        }

        if (!isEmail(req.body.email)) {
            throw new RequestError("The given email address is invalid.");
        }

        const checkForUser = await this.getUserByEmail(req.body.email);
        if (checkForUser) {
            throw new RequestError("The given email address already has a Document Workflow Account");
        }

        if (req.body.password !== req.body.confirmPassword) {
            throw new RequestError("The two passwords do not match.");
        }

        if (!isStrongPassword(req.body.password)) {
            throw new RequestError("Password is not strong enough. Ensure that it is at least 8 characters long with one uppercase character, lowercase character, number and special character");
        }

        const usr: IUser = req.body;

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
        const user: IUser = await this.userRepository.saveUser(usr);
        //const response = await this.userRepository.putUser(usr);
        if (user) {
            //logger.info(usr); It seems as though the usr object gets changed after it is saved to the database
            logger.info(req.body.email + " " + tempValidateCode);
            await this.sendVerificationEmail(req.body.email, tempValidateCode);//,
            return user;
            try {
                const usr: IUser = req.body;
                usr.signature = req.files.signature.data;
                usr.validateCode = crypto.randomBytes(64).toString('hex');
                usr.password = await this.getHashedPassword(usr.password);
                const user: IUser = await this.userRepository.saveUser(usr);
                if (user) {
                    await this.sendVerificationEmail(usr.email, usr.validateCode)//,
                    return user;
                }
            } catch (err) {
                console.error(err);
                throw new RequestError("Could not register user");
            }
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

    //returns jwt string for authentication
    async loginUser(email, password): Promise<String> {

        const user = await this.userRepository.findUser({email: email});
        if(!user){ throw new RequestError("User does not exist.")}

        if(user.validated){
            try{
                return await this.authenticateUser(password, user);
            }
            catch(err){
                throw new AuthenticationError("The entered email or password was incorrect");
            }
        } else {
            throw new AuthenticationError("Please check your emails and validate your account.");
        }
    }

    async logoutUser(token: string): Promise<void> {
        try {
            await Blacklist.addToBlacklist(token);
        }
        catch(err){
            console.error(err);
            throw new RequestError("Could not log out user");
        }
    }

    async deleteUser(req): Promise<IUser> {
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

    async getUserDetails(email: string): Promise<IUser> {
        try{
            const user: IUser = await this.userRepository.findUser({email: email});
            if(user)
                return user;
            else return null;
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

    //too generic, dangerous for elevating user privilege
    async updateUser(req): Promise<IUser> {
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

    /*async verifyEmailExistence(email, requestingUserId) {
        return Promise.resolve(undefined);
    }*/

    private static removeFromArray(array: Array<any>, value): Boolean{
        const indexOfRemovedValue = array.indexOf(value);
        if(indexOfRemovedValue != -1) {
            array.splice(indexOfRemovedValue, 1);
            return true;
        }
        return false;
    }

    private static addToArrayIfNotPresent(array: Array<any>, value): Boolean{
        if(array.indexOf(value) != -1){
            return false;
        }
        array.push(value);
        return true;
    }

    async blockUser(contactEmail: string, user): Promise<ObjectId>{
        //check if email of contact exists:
        const contact: IUser = await this.userRepository.findUser({email: contactEmail});
        if(contact){
            const currentUser: IUser = await this.userRepository.findUser({_id: user._id});
            //check if they're already a contact
            if(currentUser.blockedList.indexOf(contactEmail) != -1){
                throw new RequestError("This contact is already blocked by this user");
            }
            currentUser.blockedList.push(contactEmail);
            await this.userRepository.updateUser(currentUser);
            return contact._id;
        }else{
            throw new RequestError("Contact does not exist");
        }
    }

    async unblockUser(contactEmail: string, user): Promise<ObjectId>{
        //check if email of contact exists:
        const contact: IUser = await this.userRepository.findUser({email: contactEmail});
        if(contact){
            const currentUser: IUser = await this.userRepository.findUser({_id: user._id});
            const indexOfRemovedEmail = currentUser.blockedList.indexOf(contactEmail);
            if(indexOfRemovedEmail != -1){
                currentUser.blockedList.splice(indexOfRemovedEmail, 1);
                await this.userRepository.updateUser(currentUser);
            }else{
                throw new RequestError("This person is not blocked");
            }
            return contact._id;
        }else{
            throw new RequestError("Contact does not exist");
        }
    }

    async acceptContactRequest(contactEmail: string, user): Promise<ObjectId>{
        //get User
        const usr: IUser = await this.userRepository.findUser({email: user.email});
        //check if contact exists:
        const contact: IUser = await this.userRepository.findUser({email: contactEmail});
        if(!contact) throw new RequestError("contact doesn't exist");

        //find contact in requests array:
        const removed = UserService.removeFromArray(usr.contactRequests, contactEmail);
        if(removed){
            //add to contacts array:
            const added = UserService.addToArrayIfNotPresent(usr.contacts, contactEmail);
            if(added){
                await this.userRepository.updateUser(usr);
                return usr._id;
            }else{
                throw new ServerError("Couldn't accept contact request");
            }
        }else{
            throw new ServerError("Couldn't accept contact request");
        }
    }

    async sendContactRequest(recipientEmail, user): Promise<ObjectId>{
        //check if email of contact exists:
        //add MY email to Contact's contact requests
        const recipient: IUser = await this.userRepository.findUser({email: recipientEmail});
        if(recipient){
            const index = recipient.blockedList.indexOf(user.email);
            if(index != -1){
                throw new RequestError("User is on recipient's blocked list");
            }
            if(!(UserService.addToArrayIfNotPresent(recipient.contactRequests, user.email)))
                throw new RequestError("Contact request already exists");
            await this.userRepository.updateUser(recipient);
            return recipient._id;
        }else{
            throw new RequestError("Recipient does not exist");
        }
    }

    async rejectContactRequest(contactEmail: string, user): Promise<ObjectId>{
        //check if email of contact exists:
        const contact: IUser = await this.userRepository.findUser({email: contactEmail});
        if(contact){
            const currentUser: IUser = await this.userRepository.findUser({_id: user._id});
            const indexOfRemovedEmail = currentUser.contactRequests.indexOf(contactEmail);
            if(indexOfRemovedEmail != -1){
                currentUser.contactRequests.splice(indexOfRemovedEmail, 1);
                await this.userRepository.updateUser(currentUser);
            }else{
                throw new RequestError("Contact request does not exist");
            }
            return contact._id;
        }else{
            throw new RequestError("Contact does not exist");
        }
    }

    async deleteContact(contactEmail: string, user): Promise<ObjectId>{
        //check if email of contact exists:
        const contact: IUser = await this.userRepository.findUser({email: contactEmail});
        if(contact){
            const currentUser: IUser = await this.userRepository.findUser({_id: user._id});
            const indexOfRemovedEmail = currentUser.contacts.indexOf(contactEmail);
            if(indexOfRemovedEmail != -1){
                currentUser.contacts.splice(indexOfRemovedEmail, 1);
                await this.userRepository.updateUser(currentUser);
            }else{
                throw new RequestError("This person is not a contact");
            }
            return contact._id;
        }else{
            throw new RequestError("Contact does not exist");
        }
    }

    async addContact(contactEmail: string, user): Promise<ObjectId> {
        //check if email of contact exists:
        if(user.privilegeLevel != privilegeLevel.ADMIN){ throw new AuthenticationError("Unauthorized")}
        const contact: IUser = await this.userRepository.findUser({email: contactEmail});
        if(contact){
            const currentUser: IUser = await this.userRepository.findUser({_id: user._id});
            //check if they're already a contact
            if(currentUser.contacts.indexOf(contactEmail) != -1){
                throw new RequestError("This contact is already a contact of this user");
            }
            currentUser.contacts.push(contactEmail);
            await this.userRepository.updateUser(currentUser);
            return contact._id;
        }else{
            throw new RequestError("Contact does not exist");
        }
    }

    async getWorkflowTemplatesIds(user) {
        const usr = await this.getUserById(user._id);
        return {status:"success", data:{templateIds: usr.workflowTemplates}, message:""};
    }
}