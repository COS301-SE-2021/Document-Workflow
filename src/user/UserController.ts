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

    async postUserRoute(request): Promise<any> {
        try {
            return await this.userService.postUser(request);
        } catch (err) {
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
                res.status(200).json(await this.getUsersRoute());
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
            try {
                res.status(201).json(await this.postUserRoute(req));
            } catch(err){
                res.status(400).json(err);
            }
        });
        return this.router;
    }
}