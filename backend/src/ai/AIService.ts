import { injectable } from "tsyringe";
import * as fs from 'fs';
import {logger} from "../LoggingConfig";

@injectable()
export class AIService{
    constructor() {
    }
    classifierFilePath = 'src/ai/classifier.json';
    retrieveClassifierData(){
        const classifierData = fs.readFileSync(this.classifierFilePath).toString();
        return {status:"success", data: {classifierData: classifierData}, message:""};
    }

}