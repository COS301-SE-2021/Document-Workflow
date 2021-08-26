import { autoInjectable } from "tsyringe";
import UserService from "../user/UserService";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../error/Error";
import Database from "../Database";
import { handleErrors } from "../error/ErrorHandler";

@autoInjectable()
export default class Authenticator {
    constructor() {
    }
    public async Authenticate(req, res, next) {
        try {
            const {headers} = req;
            req.on('error', (err) => {
                console.log(err);
            });
            if (!headers.authorization) {
                throw new AuthenticationError("User could not be authenticated");
            }
            const token = req.header("Authorization").replace("Bearer ", "");

            //check blacklist for token first:
            try{
                if (await Database.checkBlacklist(token)) {
                    throw new AuthenticationError("Session has expired");
                }
            }catch(err){
                throw err;
            }

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.SECRET);
            } catch (err) {
                throw new AuthenticationError("Invalid access token");
            }

            req.user = {email: decoded.email, _id: decoded.id};
            next();
        }catch(err){
            await handleErrors(err, res);
        }
    }
}