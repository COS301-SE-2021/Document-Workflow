import { autoInjectable } from "tsyringe";
import jwt from "jsonwebtoken";
import { handleErrors } from "../error/ErrorHandler";
import { Blacklist } from "./Blacklist";

@autoInjectable()
export default class Authenticator {
    constructor() {
    }
    public async Authenticate(req, res, next) {
        try {
            const { headers } = req;
            req.on('error', (err) => {
                console.log(err);
            });
            if (!headers.authorization) {
                await Promise.reject("User could not be authenticated");
            }
            const token = req.header("Authorization").replace("Bearer ", "");

            //check blacklist for token first:
            if (await Blacklist.checkBlacklist(token)) {
                return Promise.reject(" Token is present in blacklist");
            }

            let decoded: any = jwt.verify(token, process.env.SECRET);
            if(decoded){
                req.user = { email: decoded.email, _id: decoded.id, privilege: decoded.privilege };
                next();
            }
        }catch(err){
            await handleErrors(err, res);
        }
    }
}