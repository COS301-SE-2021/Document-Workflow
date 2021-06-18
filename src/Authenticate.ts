import { autoInjectable } from "tsyringe";
import UserService from "./user/UserService";
import jwt from "jsonwebtoken";
@autoInjectable()

export default class Authenticator {

    constructor(private userService: UserService) {
    }

    Authenticate = async (req, res, next) => {
        try {
            const token = req.header("Authorization").replace("Bearer ", "");
            const decoded = jwt.verify(token, process.env.SECRET);
            const user = await this.userService.getUser({_id: decoded._id, 'tokens.token': token});
            if (!user) {
                throw new Error("User could not be found");
            }
            req.user = user;
            next();
        } catch (e) {
            res.status(401).send({status: "failed", data: {}, message: "Unable to Authenticate"});
        }
    }
}