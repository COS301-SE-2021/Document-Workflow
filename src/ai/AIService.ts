import { injectable } from "tsyringe";
import * as fs from 'fs';
import {logger} from "../LoggingConfig";


@injectable()
export class AIService{
    constructor() {
    }
    classifierFilePath = 'src/ai/ClassifierData/DocumentClassifier.json';
    decisionTreesPath = 'src/ai/decisionTreesData'; //TODO: perhaps move these paths
    retrieveClassifierData(){
        const classifierData = fs.readFileSync(this.classifierFilePath).toString();
        return {status:"success", data: {classifierData: classifierData}, message:""};
    }

    getDecisionTreesData() {
        const consultantData = fs.readFileSync(this.decisionTreesPath +'/ConsultDecisionTree.json').toString();
        return {status:"success", data: {consultantData: consultantData}, message:""};
    }
}