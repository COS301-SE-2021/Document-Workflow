import app from "./index";
//import http from "http";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;

/*const onError = error => {
    if(error.syscall !== "listen")
        throw error;
    if(error.code === "EACCES")
        console.error("requires elevated privileges");
    if(error.code === "EADDRINUSE")
        console.error("port is already in use");
};*/
/*const onListen = () => {
    console.log("listening on port" + port);
};*/

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

// const server = http.createServer(app);
// server.on("error", onError);
// server.on("listening", onListen);
// server.listen(port);