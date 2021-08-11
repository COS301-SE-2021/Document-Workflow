import { autoInjectable } from "tsyringe";
import UserService from "../user/UserService";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../error/Error";

@autoInjectable()
export default class Authenticator {

    constructor(private userService: UserService) {
    }

    //used as middleware to authenticate JWT
    Authenticate = async (req, res, next) => {
        //check if headers are present:
        //if(!req.header("Authorization")) throw new AuthenticationError("Authorization Header missing");
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.SECRET);
        const user = await this.userService.getUser({_id: decoded._id, 'tokens.token': token});
        if (!user) {
            throw new AuthenticationError("User could not be authenticated");
        }
        req.user = user;
        next();
    }
}