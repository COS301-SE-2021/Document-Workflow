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
    let testMode = false;
    if(process.env.TEST_MODE) {
        testMode = true;
        err.message = "";
    }
    if(err instanceof RequestError){
        await res.status(400).json({status: "error", data:{}, message: "Invalid Request " + err.message});
        if(testMode) console.error(err.message);
    }
    if(err instanceof PhaseError){
        await res.status(400).json({status: "error", data:{}, message: "A phase contains a user that does not exist " + err.message});
        if(testMode) console.error(err.message);
    }
    if(err instanceof AuthenticationError){
        await res.status(401).send("Authentication Error " + err.message);
        if(testMode) console.error(err.message);
    }
    if(err instanceof AuthorizationError){
        await res.status(401).send("Unauthorized " + err.message);
        if(testMode) console.error(err.message);
    }
    if(err instanceof CloudError){
        await res.status(401).send("Cloud Storage Error " + err.message);
        if(testMode) console.error(err.message);
    }
    if(err instanceof ServerError){
        await res.status(500).send("Server Error " + err.message);
        if(testMode) console.error(err.message);
    }
    if(err instanceof jwt.TokenExpiredError){
        await res.status(401).send("Session has expired " + err.message);
        if(testMode) console.error(err.message);
    }
    if(err instanceof DatabaseError){
        await res.status(401).send("Database error " + err.message);
        if(testMode) console.error(err.message);
    }
    console.error(err);
    await res.status(500).send("Error " + err.message);

}