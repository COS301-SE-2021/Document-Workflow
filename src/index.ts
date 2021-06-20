import 'reflect-metadata';
import express from 'express';
import bodyParser from "body-parser";
import { container } from "tsyringe";
import * as dotenv from 'dotenv';
import DocumentController from "./document/DocumentController";
import UserController from "./user/UserController";
import WorkFlowController from "./workflow/WorkFlowController";
dotenv.config();

const fileUpload = require('express-fileupload');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(fileUpload(undefined));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, DELETE, PUT, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'bearer');
    next();
});

app.use("/api/documents", container.resolve(DocumentController).routes());
app.use("/api/users", container.resolve(UserController).routes());
app.use("/api/workflows", container.resolve(WorkFlowController).routes());
export default app;

