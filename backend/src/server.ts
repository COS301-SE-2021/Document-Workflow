import app from "./index";
import http from "http";
import dotenv from "dotenv";
import Database from "./Database";
dotenv.config();

const port = process.env.PORT || 3000;

const onError = error => {
    if(error.syscall !== "listen")
        throw error;
    if(error.code === "EACCES")
        console.error("requires elevated privileges");
    if(error.code === "EADDRINUSE")
        console.error("port is already in use");
};

const onListen = async () => {
    console.log("Listening on port " + port);
    if(process.env.UNIT_TEST_MODE !== 'true'){
        await Database.get();
    }else{
        console.log("Application started in test mode");
    }
};

const onClose = async () => {
    console.log("Stopped listening");
    await Database.disconnect();
}

const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListen);
server.on("close", onClose);
server.listen(port);