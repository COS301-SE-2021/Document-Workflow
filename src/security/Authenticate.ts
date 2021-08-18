import { injectable } from "tsyringe";
import UserService from "../user/UserService";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../error/Error";

@injectable()
export default class Authenticator {

    constructor(private userService: UserService) {
    }

    public async Authenticate(req, res, next) {
        const { headers, method, url } = req;
        req.on('error', (err) => {
            console.log(err);
        });
        if(!headers.Authorization){
            next();
        }
        //TODO: check if headers are present:
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.SECRET);
        const user = await this.userService.getUserById(decoded.id); //NOTE: the decoded object has an id field, not a _id field
        if (!user) throw new AuthenticationError("User could not be authenticated");
        req.user = user;
        next();
    }
}