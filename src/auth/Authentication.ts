import jwt from "jsonwebtoken";
import { injectable } from "tsyringe";
import UserService from "../user/UserService";
import AuthenticationError from "../error/AuthenticationError";

@injectable()
export default class Authentication {

        constructor(private userService: UserService) {}

        /**
         * @description
         * <p>
         *      Authenticate Token
         *      Calls next after either setting user or not
         *      depending on the result of the token authentication
         * <p>
         */
        async auth(req,res,next){
                const token = req.header("Authorization").replace("Bearer ", "");
                const decoded = jwt.verify(token, process.env.SECRET);
                const user = await this.userService.getUser({_id: decoded._id, 'tokens.token': token});
                if(!user) {
                        throw new AuthenticationError("Unable to Authenticate user");
                }
                req.user = user;
                next();
        }
}

