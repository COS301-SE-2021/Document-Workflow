import { Router } from "express";
import { injectable } from "tsyringe";
import UserService from "./UserService";
import { UserProps } from "./User";
import sanitize from "../security/Sanitize";
import { RequestError, ServerError } from "../error/Error";
import { handleErrors } from "../error/ErrorHandler";
import Authenticator from "../security/Authenticate";
import sanitizeRequest from "./../security/Sanitize";
import { ObjectId } from "mongoose";


@injectable()
export default class UserController{
    private readonly router: Router;

    constructor(private userService: UserService, private authenticationService: Authenticator) {
        this.router = new Router();
    }

    auth = this.authenticationService.Authenticate;

    private async getUsersRoute(): Promise<UserProps[]> {
        try{
            return await this.userService.getAllUsers();
        } catch(err) {
            throw new ServerError(err.toString());
        }
    }

    private async getUserByIdRoute(request): Promise<UserProps> {
        try{
            return await this.userService.getUser(request);
        }catch(err) {
            throw new ServerError(err.toString());
        }
    }

    private async getUserByEmailRoute(request): Promise<UserProps> {
        try{
            return await this.userService.getUserByEmail(request);
        }catch(err) {
            throw new ServerError(err.toString());
        }
    }

    private async registerUserRoute(request): Promise<UserProps>{
        try{
            return await this.userService.registerUser(request)
        }
        catch(err){
            throw new ServerError(err.toString());
        }
    }

    private async verifyUserRoute(request): Promise<UserProps>{
        try {
            return await this.userService.verifyUser(request);
        }
        catch(err){
            throw new ServerError(err.toString());
        }
    }

    private async loginUserRoute(req): Promise<String> {
        if(!req.body.email || !req.body.password){
            throw new RequestError("Could not log in");
        }
        try {
            return await this.userService.loginUser(req.body.email, req.body.password);
        }
        catch(err){
            throw err;
        }
    }

    private async sendContactRequestRoute(req): Promise<ObjectId> {
        console.log(req);
        if(!req.body.contactemail)
            throw new RequestError("Missing contactEmail");
        try{return await this.userService.sendContactRequest(req.body.contactemail, req.user);}
        catch(err){
            throw err;
        }
    }

    private async rejectContactRequestRoute(req): Promise<ObjectId> {
        if(!req.body.contactemail)
            throw new RequestError("Missing contactEmail");
        try{return await this.userService.rejectContactRequest(req.body.contactemail, req.user);}
        catch(err){
            throw err;
        }
    }

    private async addBlockedContactRoute(req){
        if(!req.body.contactemail)
            throw new RequestError("Missing contactEmail");
        try{return await this.userService.blockUser(req.body.contactemail, req.user);}
        catch(err){
            throw err;
        }
    }
    private async removeBlockedContactRoute(req){
        if(!req.body.contactemail)
            throw new RequestError("Missing contactEmail");
        try{return await this.userService.unblockUser(req.body.contactemail, req.user);}
        catch(err){
            throw err;
        }
    }

    private async deleteContactRoute(req){
        if(!req.body.contactemail)
            throw new RequestError("Missing contactEmail");
        try{return await this.userService.deleteContact(req.body.contactemail, req.user);}
        catch(err){
            throw err;
        }
    }
    
    private async acceptContactRequestRoute(req){
        if(!req.body.contactemail)
            throw new RequestError("Missing contactEmail");
        try{return await this.userService.acceptContactRequest(req.body.contactemail, req.user);}
        catch(err){
            throw err;
        }
    }

    private async getContactsRoute(req): Promise<String[]> {
        if(!req.user.email) throw new RequestError("Missing User details for this request");
        try{
            return await this.userService.getContacts(req.user.email);
        }
        catch(err){
            throw new ServerError(err.toString());
        }
    }

    private async getContactRequestsRoute(req): Promise<String[]> {
        if(!req.user.email) throw new RequestError("Missing User details for this request");
        try{
            return await this.userService.getContactRequests(req.user.email);
        }
        catch(err){
            throw new ServerError(err.toString());
        }
    }

    private async getUserDetails(req) {
        try{
            return await this.userService.getUserDetails(req);
        }
        catch(err){
            throw err;
        }
    }

    private async logoutUserRoute(req): Promise<Boolean> {
        try{
            const { headers } = req;
            if(headers.authorization){
                const token = headers.authorization.split(" ")[1];
                if(token) return await this.userService.logoutUser(token);
            }
            return false;
        }
        catch(err){
            throw new ServerError(err.toString());
        }
    }

    private async deleteUserRoute(request): Promise<UserProps> {
        try{
            return await this.userService.deleteUser(request);
        }catch(err){
            throw new ServerError(err.toString());
        }
    }

    private async updateUserRoute(request): Promise<UserProps> {
        try{
            return await this.userService.updateUser(request);
        }
        catch(err){
            throw new ServerError(err.toString());
        }
    }

    private async generatePasswordResetRequest(req){
        if(!req.body.email){
            throw new RequestError("Must list the email address of the user");
        }
        return await this.userService.generatePasswordReset(req.body.email);
    }

    private async resetPassword(req){
        if(!req.body.email){
            throw new RequestError("You must list the email address of the user");
        }

        if(!req.body.password || !req.body.confirmPassword){
            throw new RequestError("You must include the new password as well ass the password confirmationfield");
        }

        if(req.body.password != req.body.confirmPassword){
            throw new RequestError("The input password and confirmation password do not match");
        }

        if(!req.body.token){
            throw new RequestError("You must include the password reset token with this request");
        }

        return await this.userService.resetPassword(req.body.email, req.body.password, req.body.token);
    }


    /*private async verifyEmailExistence(req) {
        if(!req.body.email)
            throw new RequestError("Cannot verify existence of null email");
        try{
            return await this.userService.verifyEmailExistence(req.body.email, req.user._id);
        }
        catch(err){
            throw err;
        }
    }*/

    /**
     * This function is used to fetch the ids of the workflow templates owned by a user.
     * We don't allow the user to pass through any data: that is, we get the user making the request
     * from the input JWT. If we did this differently, it could be a security risk since then users
     * could make requests to this api endpoint but get the data for workflow templates belonging to other users.
     * @param req
     * @private
     */
    private async getWorkflowTemplatesIds(req) {

        return await this.userService.getWorkflowTemplatesIds(req.user);
    }

    routes() {
        this.router.get("", this.authenticationService.Authenticate, async (req, res) => {
            try {
                const users = await this.getUsersRoute();
                if(users) res.status(200).json(users);
                else res.status(404).send();
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/sendContactRequest", this.auth, async (req, res) => {
            try{
                const contactId = await this.sendContactRequestRoute(req);
                res.status(200).json({status: "success", data:{"ObjectId": contactId }, message: "Contact request added"});
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/rejectContactRequest", this.auth, async (req, res) => {
            try{
                const contactId = await this.rejectContactRequestRoute(req);
                res.status(200).json({status: "success", data:{"RequestingUserId": contactId }, message: "Contact request rejected"});
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/deleteContact", this.auth, async (req, res) => {
            try{
                const contactId = await this.deleteContactRoute(req);
                res.status(200).json({status: "success", data:{"DeletedUserId": contactId }, message: "Contact removed"});
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/blockUser", this.auth, async (req, res) => {
            try{
                const contactId = await this.addBlockedContactRoute(req);
                res.status(200).json({status: "success", data:{"BlockedUserId": contactId }, message: "Contact blocked"});
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.delete("/unblockUser", this.auth, async (req, res) => {
            try{
                const contactId = await this.removeBlockedContactRoute(req);
                res.status(200).json({status: "success", data:{"UnblockedUserId": contactId }, message: "Contact removed from blocked list"});
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/acceptContactRequest", this.auth, async (req, res) => {
            try{
                const contactId = await this.acceptContactRequestRoute(req);
                res.status(200).json({status: "success", data:{"ObjectId": contactId }, message: "Contact request accepted"});
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/getContactRequests", this.authenticationService.Authenticate , async (req, res) => {
            try {
                const userContactRequests = await this.getContactRequestsRoute(req);
                if(userContactRequests) {
                    if(userContactRequests.length == 0){
                        res.status(200).json({status: "success", data:{}, message: "This user does not have any contact requests"});
                    }else{
                        res.status(200).json({status: "success", data:{"requests": userContactRequests }, message: "Contact Requests successfully retrieved"});
                    }
                }
                else res.status(404).send("Could not find User");
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/getContacts", this.authenticationService.Authenticate , async (req, res) => {
            try {
                const userContacts = await this.getContactsRoute(req);
                if(userContacts) res.status(200).json({status: "success", data:{"contacts": userContacts }, message: "Contacts successfully retrieved"});
                if(userContacts) {
                    if(userContacts.length == 0){
                        res.status(200).json({status: "success", data:{}, message: "This user does not have contacts yet"});
                    }else{
                        res.status(200).json({status: "success", data:{"contacts": userContacts }, message: "Contacts successfully retrieved"});
                    }
                }
                else res.status(404).send("Could not find User");
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });


        this.router.post("", async(req, res) =>{
            try{
                res.status(200).send(await this.registerUserRoute(req));
            }
            catch(err){
                await handleErrors(err, res);
            }
        });

        this.router.get("/verify", sanitizeRequest, async(req,res) =>{
            try {
                res.status(200).send(await this.verifyUserRoute(req));
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/getDetails", this.authenticationService.Authenticate, async (req,res) => {
            try {
                res.status(200).json(await this.getUserDetails(req));
            } catch(err){
                console.log("Fetching user details had an error");
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.get("/findById/:id", this.authenticationService.Authenticate , async (req, res) => {
            try {
                const user = await this.getUserByIdRoute(req);
                if(user) res.status(200).json(user);
                else res.status(404).send("Could not find User");
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.get("/findByEmail/:email", async (req, res) => {
            try {
                const user = await this.getUserByEmailRoute(req);
                if(user) res.status(200).json(user);
                else res.status(404).send("Could not find User");
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/login" , async (req,res) => {
            try {
                const token = await this.loginUserRoute(req);
                if(token) res.status(200).json({status: "success", data:{"token": token}, message: ""});
                else res.status(400).send("Could not log in user");
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/logout", this.auth, async (req,res) => {
            try{
                if(await this.logoutUserRoute(req)) res.status(200).json({status: "success", data: {}, message: "Successfully logged out"});
                else res.status(400).send("User could not be logged out");
            }
            catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/register", async (req,res) => {
            try {
                const user = await this.registerUserRoute(req);
                if(user) res.status(201).json(user);
                else res.status(400).send("Could not register User");
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        //This route is used by the front end to forbid access to certain pages.
        this.router.post("/authenticate", this.authenticationService.Authenticate, async (req,res) =>{
            try{
                res.status(200).json({status:"success", data:{}, message:""});
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }

        });

        this.router.put("/create/:id", sanitize, this.authenticationService.Authenticate , async (req, res) => {
            try {
                const user = await this.updateUserRoute(req);
                if(user) res.status(200).json(user);
                else res.status(400).send("Could not update User");
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.delete("", this.authenticationService.Authenticate, async (req, res) => {
            try {
                const user = await this.deleteUserRoute(req);
                if(user) res.status(203).json(user);
                else res.status(404).send("User does not exist");
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/generatePasswordResetRequest", async(req, res)=>{
        
            try{
                res.status(200).json(await this.generatePasswordResetRequest(req));
            } catch(err){
                await handleErrors(err,res)
            }
        });

        /*this.router.post("/verifyEmailExistence", this.authenticationService.Authenticate, async (req, res) => {
            try {
                return await this.verifyEmailExistence(req);
            } catch(err){
                res.status(200).json({status:"error", data: {}, message: ""});
                try{await handleErrors(err,res);}catch{}
                await handleErrors(err,res);
            }
        });*/

        this.router.post("/getWorkflowTemplatesIds", this.authenticationService.Authenticate, async(req, res) =>{
            try {
                res.status(200).json(await this.getWorkflowTemplatesIds(req));
            } catch(err){
                await handleErrors(err,res);
            }
        });

        this.router.get("/test", async (req, res) => {
            res.status(200).json("Server is running");
        })

        return this.router;
    }

}