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
                throw new Error();
            }
            req.user = user;
            next();
        } catch (e) {
            res.status(401).send({message: "Unable to Authenticate"});
        }
    }

    async getUsersRoute(): Promise<UserI[]> {
        try{
            return await this.userService.getAllUsers();
        } catch(err) {
            throw err;
        }
    }

    async getUserByIdRoute(request): Promise<UserI> {
        try{
            return await this.userService.getUserById(request);
        }catch(err) {
            throw err;
        }
    }

    async getUserByEmailRoute(request): Promise<UserI> {
        try{
            return await this.userService.getUserByEmail(request);
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

    async loginUserRoute(request): Promise<any> {

        try {
            return await this.userService.loginUser(request);
        }
        catch(err){
            console.log(err);
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
        this.router.get("", this.Authenticate, async (req, res) => {

            try {
                res.status(200).json(await this.getUsersRoute());
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.post("/login", async (req,res) => {
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

        this.router.get("/verify", async(req,res) =>{
            try {
                res.status(200).json(await this.verifyUserRoute(req));
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.get("/:id", this.Authenticate , async (req, res) => {
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

        this.router.post("", async (req,res) => {
            try {
                //returns JWT if successful:
                res.status(201).json({message: await this.registerUserRoute(req)});
            } catch(err){
                res.status(400).json(err);
            }
        });
        return this.router;
    }
}