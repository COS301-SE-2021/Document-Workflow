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

    async loginUserRoute(request) : Promise<any>{}


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
                res.status(400).json(err);
            }
        });

        this.router.post("/login", async (req,res) => {
            try {
                let inner_res =await this.loginUserRoute(req);
                res.status(200).json(
                    {status: "Success", data:{}, message: "JWT TOKEN HERE"} //TODO: return a JWT Token!!!
                )
            } catch(err){ //Lets assume that we throw the error message up to here.
                res.status(400).json({status: "Failed", data:{}, message: err});
            }
        });

        this.router.get("/verify", async(req,res) =>{
            try {
                res.status(200).json(await this.verifyUserRoute(req));
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