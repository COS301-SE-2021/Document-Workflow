import { Router } from "express";
import { autoInjectable } from "tsyringe";
import UserService from "./UserService";
import { UserI } from "./User";

// "/api/users"

@autoInjectable()
export default class UserController{
    router: Router;

    constructor(private userService: UserService) {
        this.router = new Router();
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
        try{
            return await this.userService.loginUser(request);
        }
        catch(err)
        {
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
        this.router.get("", async (req, res) => {
            try {
                res.status(200).json(await this.registerUserRoute(req));
            } catch(err){
                res.status(400).json({status:"error", data:{}, message:err});
            }
        });

        this.router.post("/retrieveOwnedWorkflows", async (req,res) =>{

            try {
                res.status(200).json(await this.retrieveOwnedWorkFlows(req));
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.post("/retrieveWorkflows", async(req,res) =>{
            console.log(req);
            console.log(req.headers);
            try {
                res.status(200).json(await this.retrieveWorkFlows(req));
            } catch(err){
                res.status(400).json({status:"error", data:{}, message:err});
            }
        });

        this.router.post("/login", async (req,res) => { //TODO: return a JWT token
            try {
                res.status(200).json( await this.loginUserRoute(req));
            } catch(err){ //Lets assume that we throw the error message up to here.
                //NBNBNBNB DONT CHANGE THIS RESPONSE CODE JUST YET!!!!
                res.status(200).json({status: "Failed", data:{}, message: err}); //TODO change the status in such a way that it doesnt break the frontend pls
            }
        });

        this.router.get("/verify", async(req,res) =>{
            try {
                res.status(200).send(await this.verifyUserRoute(req));
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.get("/:id", async (req, res) => {
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

        this.router.post("", async (req,res) => {
            console.log("Register request");
            //console.log(req.body);
            try {
                res.status(201).json(await this.registerUserRoute(req));
            } catch(err){
                res.status(400).json(err);
            }
        });
        return this.router;
    }


}