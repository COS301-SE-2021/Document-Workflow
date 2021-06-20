import { Router } from "express";
import { injectable } from "tsyringe";
import UserService from "./UserService";
import { UserProps } from "./User";
import { sanitize } from "mongo-sanitize";
import RequestError from "../error/RequestError";
import ServerError from "../error/ServerError";
import AuthenticationError from "../error/AuthenticationError";
import jwt from "jsonwebtoken";

@injectable()
export default class UserController{
    private readonly router: Router;

    constructor(private userService: UserService) {
        this.router = new Router();
    }

    async auth(req,res,next){
        try{
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = {id: decoded.id, email: decoded.email, token: token};
        next();
        }
        catch(err){
            console.error(err);
        }
    }

    async sanitize(req, res, next): Promise<void>{
        if(req.body) sanitize(req.body);
        if(req.token) sanitize(req.token);
        if(req.params) sanitize(req.params);
        if(req.user) sanitize(req.user);
        if(req.token) sanitize(req.token);
        next();
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
            console.error(err);
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

    private async retrieveOwnedWorkFlows(req):Promise<any> {
        try{
            return await this.userService.retrieveOwnedWorkFlows(req);
        }
        catch(err) {
            throw err;
        }
    }

    async logoutUserRoute(request): Promise<UserProps> {
        try{
            return await this.userService.logoutUser(request);
        }
        catch(err){
            throw new ServerError(err.toString());
        }
    }

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

    handleErrors(err: Error, res){
        if(err instanceof RequestError){
            res.status(400).send(err.message);
        }
        else if(err instanceof AuthenticationError){
            res.status(401).send(err.message);
        }
        else if(err instanceof ServerError){
            res.status(500).send(err.message);
        }
        else if(err instanceof jwt.TokenExpiredError){
            res.status(401).send(err.message);
        }
        else{
            console.error(err);
            res.status(500).send(err.message);
        }
    }

    routes() {
        this.router.get("", this.auth, async (req, res) => {
            try {
                const users = await this.getUsersRoute();
                if(users) res.status(200).json(users);
                else res.status(404).send();
            } catch(err){
                if(err instanceof RequestError){
                    res.status(400).send(err.message);
                }
                else{
                    console.error(err);
                    res.status(500).end();
                }
            }
        });

        this.router.get("/verify", this.sanitize, async(req,res) =>{
            try {
                res.status(200).send(await this.verifyUserRoute(req));
            } catch(err){
                this.handleErrors(err,res);
            }
        });

        this.router.post("/getDetails", this.auth, async (req,res) => {
            try {
                res.status(200).json(await this.getUserDetails(req));
            } catch(err){
                res.status(400).json({status: "failed", data:{}, message: err.message});
            }
        });

        this.router.get("/:id", this.auth , async (req, res) => {
            try {
                const user = await this.getUserByIdRoute(req);
                if(user) res.status(200).json(user);
                else res.status(404).send("Could not find User");
            } catch(err){
                this.handleErrors(err,res);
            }
        });

        this.router.get("/:email", async (req, res) => {
            try {
                const user = await this.getUserByEmailRoute(req);
                if(user) res.status(200).json(user);
                else res.status(404).send("Could not find User");
            } catch(err){
                this.handleErrors(err,res);
            }
        });

        this.router.post("/login" , async (req,res) => {
            try {
                const token = await this.loginUserRoute(req);
                if(token) res.status(200).json({status: "Success", data:{}, message: token})
                else res.status(400).send("Could not log in user");
            } catch(err){
                this.handleErrors(err,res);
            }
        });

        this.router.post("/logout", this.auth, async (req,res) => {
            try{
                const user = await this.logoutUserRoute(req);
                if(user) res.status(200).send("Successfully logged out");
                else res.status(400).send("User could not be logged out");
            }
            catch(err){
                this.handleErrors(err,res);
            }
        });

        this.router.post("/register", async (req,res) => {
            try {
                const user = await this.registerUserRoute(req);
                if(user) res.status(201).json(user);
                else res.status(400).send("Could not register User");
            } catch(err){
                this.handleErrors(err,res);
            }
        });

        this.router.post("/authenticate", this.Authenticate, async (req,res) =>{ //This route is used by the front end to forbid access to certain pages.
            res.status(200).json({status:"success", data:{}, message:""});
        });

        this.router.put("/:id", this.sanitize, this.auth , async (req, res) => {
            try {
                const user = await this.updateUserRoute(req);
                if(user) res.status(200).json(user);
                else res.status(400).send("Could not update User");
            } catch(err){
                this.handleErrors(err,res);
            }
        });

        this.router.delete("", this.auth, async (req, res) => {
            try {
                const user = await this.deleteUserRoute(req);
                if(user) res.status(203).json(user);
                else res.status(404).send("User does not exist");
            } catch(err){
                this.handleErrors(err,res);
            }
        });

        return this.router;
    }
}