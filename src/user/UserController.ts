import { Router } from "express";
import { autoInjectable } from "tsyringe";
import UserService from "./UserService";
import User from "./User";
import Authentication from "../auth/Authentication";
import { sanitize } from "mongo-sanitize";
import RequestError from "../error/RequestError";

@autoInjectable()
export default class UserController{
    private readonly router: Router;

    constructor(private userService: UserService, private authentication: Authentication) {
        this.router = new Router();
    }

    async auth(req, res, next) {
        await this.authentication.auth(req,res,next);
    }

    async sanitize(req, res, next){
        if(req.body) sanitize(req.body);
        if(req.token) sanitize(req.token);
        if(req.params) sanitize(req.params);
        if(req.user) sanitize(req.user);
        if(req.token) sanitize(req.token);
        next();
    }

    async getUsersRoute(): Promise<User[]> {
        try{
            return await this.userService.getAllUsers();
        } catch(err) {
            throw err;
        }
    }

    async getUserByIdRoute(request): Promise<User> {
        try{
            return await this.userService.getUserById(request);
        }catch(err) {
            throw err;
        }
    }

    async getUserByEmailRoute(request): Promise<User> {
        try{
            return await this.userService.getUserByEmail(request);
        }catch(err) {
            throw err;
        }
    }

    async registerUserRoute(request) :Promise<User>{
        try{
            return await this.userService.registerUser(request)
        }
        catch(err)
        {
            throw err;
        }
    }

    async verifyUserRoute(request): Promise<User>{
        try {
            return await this.userService.verifyUser(request);
        }
        catch(err){
            throw err;
        }
    }

    async loginUserRoute(request): Promise<User> {

        try {
            return await this.userService.loginUser(request);
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }

    async logoutUserRoute(request): Promise<User> {
        try{
            return await this.userService.logoutUser(request);
        }
        catch(err){
            throw err;
        }
    }

    async deleteUserRoute(request): Promise<User> {
        try{
            return await this.userService.deleteUser(request);
        }catch(err){
            throw err;
        }
    }

    async updateUserRoute(request): Promise<User> {
        try{
            return await this.userService.updateUser(request);
        }
        catch(err){
            throw err;
        }

    }

    routes() {
        this.router.get("", this.auth, async (req, res) => {
            try {
                res.status(200).json(await this.getUsersRoute());
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.get("/verify", this.sanitize, async(req,res) =>{
            try {
                res.status(200).json(await this.verifyUserRoute(req));
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.get("/:id", this.auth , async (req, res) => {
            try {
                res.status(200).json(await this.getUserByIdRoute(req));
            } catch(err){
                if(err instanceof URIError){
                    res.status(400).json("id field is required");
                } else {
                    res.status(400).json(err);
                }

            }
        });

        this.router.get("/:email", async (req, res) => {
            try {
                res.status(200).json(await this.getUserByEmailRoute(req));
            } catch(err){
                if(err instanceof URIError){
                    res.status(400).json("id field is required");
                } else {
                    res.status(400).json(err);
                }

            }
        });

        this.router.post("/login" , this.sanitize, async (req,res) => {
            try {
                let token = await this.loginUserRoute(req);
                if(token){
                    res.status(200).json(
                        {status: "Success", data:{}, message: token}
                    )
                } else {
                    res.status(400).send("Could not log in user");
                }
            } catch(err){ //Lets assume that we throw the error message up to here.
                res.status(400).json({status: "Failed", data:{}, message: err});
            }
        });

        this.router.post("/logout", this.auth, async (req,res) => {
            try{
                await this.logoutUserRoute(req);
                res.status(200).send();
            }
            catch(err){
                res.status(500).json(err).send();
            }
        });

        this.router.post("/register", this.sanitize, async (req,res) => {
            try {
                //returns JWT if successful:
                res.status(201).json({message: await this.registerUserRoute(req)});
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.put("/:id", this.sanitize, this.auth , async (req, res) => {
            try {
                res.status(200).json(await this.updateUserRoute(req));
            } catch(err){
                if(err instanceof RequestError){
                    res.status(400).json("id field is required");
                } else {
                    res.status(400).json(err);
                }

            }
        });

        this.router.delete("", this.auth, async (req, res) => {
            try {
                res.status(203).json(await this.deleteUserRoute(req)).send();
            } catch(err){
                res.status(400);
            }
        });

        return this.router;
    }
}