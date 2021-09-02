import { injectable } from "tsyringe";
import * as fs from 'fs';
import {logger} from "../LoggingConfig";

@injectable()
export class AIService{
    constructor() {
    }

    retrieveClassifierData(){
        const classifierData = fs.readFileSync('src/ai/classifier.json').toString(); //TODO: change this pathname
        return {status:"success", data: {classifierData: classifierData}, message:""};
    }

}