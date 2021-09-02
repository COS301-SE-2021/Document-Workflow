import { Router } from "express";
import { injectable } from "tsyringe";
import UserService from "./UserService";
import { UserProps } from "./User";
import sanitize from "../security/Sanitize";
import {RequestError, ServerError} from "../error/Error";
import { handleErrors } from "../error/ErrorHandler";
import Authenticator from "../security/Authenticate";
import sanitizeRequest from "./../security/Sanitize";

@injectable()
export default class UserController{
    private readonly router: Router;

    constructor(private userService: UserService, private authenticationService: Authenticator) {
        this.router = new Router();
    }

    async getUsersRoute(): Promise<UserProps[]> {
        try{
            return await this.userService.getAllUsers();
        } catch(err) {
            throw new ServerError(err.toString());
        }
    }

    async getUserByIdRoute(request): Promise<UserProps> {
        try{
            return await this.userService.getUser(request);
        }catch(err) {
            throw new ServerError(err.toString());
        }
    }

    async getUserByEmailRoute(request): Promise<UserProps> {
        try{
            return await this.userService.getUserByEmail(request);
        }catch(err) {
            throw new ServerError(err.toString());
        }
    }

    async registerUserRoute(request): Promise<UserProps>{
        try{
            return await this.userService.registerUser(request)
        }
        catch(err){
            throw new ServerError(err.toString());
        }
    }

    async verifyUserRoute(request): Promise<UserProps>{
        try {
            return await this.userService.verifyUser(request);
        }
        catch(err){
            throw new ServerError(err.toString());
        }
    }

    async loginUserRoute(request): Promise<UserProps> {
        try {
            return await this.userService.loginUser(request);
        }
        catch(err){
            throw err;
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

    /*async logoutUserRoute(request): Promise<UserProps> {
        try{
            return await this.userService.logoutUser(request);
        }
        catch(err){
            throw new ServerError(err.toString());
        }
    }*/

    async deleteUserRoute(request): Promise<UserProps> {
        try{
            return await this.userService.deleteUser(request);
        }catch(err){
            throw new ServerError(err.toString());
        }
    }

    async updateUserRoute(request): Promise<UserProps> {
        try{
            return await this.userService.updateUser(request);
        }
        catch(err){
            throw new ServerError(err.toString());
        }
    }

    private async verifyEmailExistence(req) {
        if(!req.body.email)
            throw new RequestError("Cannot verify existence of null email");

        try{
            return await this.userService.verifyEmailExistence(req.body.email, req.user._id);
        }
        catch(e){
            throw e;
        }
    }

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
                await handleErrors(err,res);
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
                await handleErrors(err,res);
            }
        });

        this.router.post("/getDetails", this.authenticationService.Authenticate, async (req,res) => {
            try {
                res.status(200).json(await this.getUserDetails(req));
            } catch(err){
                console.log("Fetcing user details had an error");
                await handleErrors(err,res);
            }
        });

        this.router.get("/find/:id", this.authenticationService.Authenticate , async (req, res) => {
            try {
                const user = await this.getUserByIdRoute(req);
                if(user) res.status(200).json(user);
                else res.status(404).send("Could not find User");
            } catch(err){
                await handleErrors(err,res);
            }
        });

        this.router.get("/find/:email", async (req, res) => {
            try {
                const user = await this.getUserByEmailRoute(req);
                if(user) res.status(200).json(user);
                else res.status(404).send("Could not find User");
            } catch(err){
                await handleErrors(err,res);
            }
        });

        this.router.post("/login" , async (req,res) => {
            try {
                const token = await this.loginUserRoute(req);
                if(token) res.status(200).json({status: "success", data:{"token": token}, message: ""});
                else res.status(400).send("Could not log in user");
            } catch(err){
                await handleErrors(err,res);
            }
        });

        /*this.router.post("/logout", this.authenticationService.Authenticate, async (req,res) => {
            try{
                const user = await this.logoutUserRoute(req);
                if(user) res.status(200).send("Successfully logged out");
                else res.status(400).send("User could not be logged out");
            }
            catch(err){
                await handleErrors(err,res);
            }
        });*/

        this.router.post("/register", async (req,res) => {
            try {
                const user = await this.registerUserRoute(req);
                if(user) res.status(201).json(user);
                else res.status(400).send("Could not register User");
            } catch(err){
                await handleErrors(err,res);
            }
        });

        this.router.post("/authenticate", this.authenticationService.Authenticate, async (req,res) =>{ //This route is used by the front end to forbid access to certain pages.
            res.status(200).json({status:"success", data:{}, message:""});
        });

        this.router.put("/create/:id", sanitize, this.authenticationService.Authenticate , async (req, res) => {
            try {
                const user = await this.updateUserRoute(req);
                if(user) res.status(200).json(user);
                else res.status(400).send("Could not update User");
            } catch(err){
                await handleErrors(err,res);
            }
        });

        this.router.delete("", this.authenticationService.Authenticate, async (req, res) => {
            try {
                const user = await this.deleteUserRoute(req);
                if(user) res.status(203).json(user);
                else res.status(404).send("User does not exist");
            } catch(err){
                await handleErrors(err,res);
            }
        });

        this.router.post("/verifyEmailExistence", this.authenticationService.Authenticate, async (req, res) => {
            try {
                return await this.verifyEmailExistence(req);
            } catch(err){
                await handleErrors(err,res);
            }
        });

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