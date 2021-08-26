import jwt from "jsonwebtoken";
import {
    RequestError,
    AuthenticationError,
    AuthorizationError,
    ServerError,
    CloudError,
    DatabaseError,
    PhaseError
} from "./Error";
import dotenv from "dotenv";
dotenv.config();

export async function handleErrors(err: Error, res){
    let testMode = true;
    let msg = err.message;
    if(!process.env.TEST_MODE) {
        testMode = false;
        msg = "";
    }

    if(err instanceof RequestError){
        await res.status(400).json({status: "error", data:{}, message: "Invalid Request " + msg});
        if(testMode) console.error(err.message);
    }
    if(err instanceof PhaseError){
        await res.status(400).json({status: "error", data:{}, message: "A phase contains a user that does not exist " + msg});
        if(testMode) console.error(err.message);
    }
    if(err instanceof AuthenticationError){
        await res.status(401).json({status: "error", data:{}, message: "Authentication Error " + msg});
        if(testMode) console.error(err.message);
    }
    if(err instanceof AuthorizationError){
        await res.status(401).send("Unauthorized " + msg);
        if(testMode) console.error(err.message);
    }
    if(err instanceof CloudError){
        await res.status(401).send("Cloud Storage Error " + msg);
        if(testMode) console.error(err.message);
    }
    if(err instanceof ServerError){
        await res.status(500).send("Server Error " + msg);
        if(testMode) console.error(err.message);
    }
    if(err instanceof jwt.TokenExpiredError){
        await res.status(401).send("Session has expired " + msg);
        if(testMode) console.error(err.message);
    }
    if(err instanceof DatabaseError){
        await res.status(401).send("Database error " + msg);
        if(testMode) console.error(err.message);
    }
    console.error(err);
    //unsafe
    await res.status(500).send("Error " + msg);

}