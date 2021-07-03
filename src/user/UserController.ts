import { Router } from "express";
import { autoInjectable } from "tsyringe";
import UserService from "./UserService";
import { UserI } from "./User";
import jwt from "jsonwebtoken";

// "/api/users"

@autoInjectable()
export default class UserController{
    router: Router;

    constructor(private userService: UserService) {
        this.router = new Router();
    }

    Authenticate = async(req,res,next)=>{
        try{
            const token = req.header("Authorization").replace("Bearer ", "");
            const decoded = jwt.verify(token, process.env.SECRET);
            const user = await this.userService.getUser({_id: decoded._id, 'tokens.token': token});
            if(!user) {
                throw new Error("User could not be found");
            }
            req.user = user;
            next();
        } catch (e) {
            res.status(401).send({status: "failed", data: {},  message: "Unable to Authenticate"});
        }
    }

    async getUsersRoute(): Promise<UserI[]> {
        try{
            return await this.userService.getUsers();
        } catch(err) {
            throw err;
        }
    }

    async getUserRoute(request): Promise<UserI> {
        try{
            return await this.userService.getUser(request);
        }catch(err) {
            throw err;
        }
    }


    async registerUserRoute(request) :Promise<any>{
        try{
            return await this.userService.registerUser(request)
        }
        catch(err)
        {
            throw err;
        }
    }

    async verifyUserRoute(request) : Promise<any>{
        try {
            return await this.userService.verifyUser(request);
        }
        catch(err){
            throw err;
        }
    }

    async loginUserRoute(request) : Promise<any>{
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

    private async retrieveOwnedWorkFlows(req):Promise<any> {
        try{
            return await this.userService.retrieveOwnedWorkFlows(req);
        }
        catch(err) {
            throw err;
        }
    }

    private async retrieveWorkFlows(req):Promise<any> {
        try{
            return await this.userService.retrieveWorkFlows(req);
        }
        catch(err) {
            throw err;
        }
    }

    /*
    * error codes:
    * 200 OK request succeeded
    * 201 Created
    * 202 Accepted -> received but not acted upon
    * 400 Bad request
    * 401 Unauthorized -> (unauthenticated) Client id not known
    * 403 Forbidden -> Client id known
    * 404 Not found
    * 405 Method not allowed
    * 418 I'm a teapot
    * 500 Internal Server Error
    * 507 Insufficient Storage
    * */

    routes() {
        this.router.post("", async (req,res) => {
            try {
                res.status(201).json(await this.registerUserRoute(req));
            } catch(err){
                console.log("Could not create new user");
                console.log(err);
                res.status(200).json(err);
            }
        });
        /*
        this.router.get("", this.Authenticate, async (req, res) => {
            try {
                res.status(200).json(await this.getUsersRoute());
            } catch(err){
                res.status(400).json(err);
            }
        });*/

        this.router.post("/retrieveOwnedWorkflows", this.Authenticate, async (req,res) =>{
            try {
                res.status(200).json(await this.retrieveOwnedWorkFlows(req));
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.post("/retrieveWorkflows",  this.Authenticate, async(req,res) =>{
            try {
                res.status(200).json(await this.retrieveWorkFlows(req));
            } catch(err){
                res.status(400).json({status:"error", data:{}, message:err});
            }
        });

        this.router.post("/login",  async (req,res) => {
            try {
                let token = await this.loginUserRoute(req);
                if(token){
                    res.status(200).json(
                        {status: "success", data:{token: token}, message: ""}
                    )
                } else {
                    res.status(400).send("Could not log in user"); //Unexpected error occurred
                }
            } catch(err){
                //Leave this as status 200 for now. We can change it after demo 2 if we really want but its important for the backend.
                res.status(200).json({status: "failed", data:{}, message: err.message});
            }
        });

        this.router.post("/getDetails", this.Authenticate, async (req,res) => {
            try {
                res.status(200).json(await this.getUserDetails(req));
            } catch(err){
                res.status(400).json({status: "failed", data:{}, message: err.message});
            }
        });

        this.router.get("/verify", async(req,res) =>{
            try {
                res.status(200).send(await this.verifyUserRoute(req));
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.get("/:id", this.Authenticate , async (req, res) => {
            try {
                res.status(200).json(await this.getUserRoute(req));
            } catch(err){
                if(err instanceof URIError){
                    res.status(400).json("id field is required");
                } else {
                    res.status(400).json(err);
                }

            }
        });

        this.router.post("/authenticate", this.Authenticate, async (req,res) =>{ //This route is used by the front end to forbid access to certain pages.
            res.status(200).json({status:"success", data:{}, message:""});
        });

        return this.router;
    }


}