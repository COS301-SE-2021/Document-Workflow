import jwt from "jsonwebtoken";
import {RequestError, AuthenticationError, AuthorizationError, ServerError } from "./Error";

/**
 * @
 *
 */
export async function handleErrors(err: Error, res){
    if(err instanceof RequestError){
        await res.status(400).send(err.message);
    }
    if(err instanceof AuthenticationError){
        await res.status(401).send(err.message);
    }
    if(err instanceof AuthorizationError){
        await res.status(401).send(err.message);
    }
    if(err instanceof ServerError){
        await res.status(500).send(err.message);
    }
    if(err instanceof jwt.TokenExpiredError){
        await res.status(401).send(err.message);
    }
    console.error(err);
    await res.status(500).send(err.message);

}