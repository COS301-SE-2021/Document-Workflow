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
        const expenseDate = fs.readFileSync(this.decisionTreesPath +'/ExpenseDecisionTree.json').toString();
        const covidData = fs.readFileSync(this.decisionTreesPath +'/CovidDecisionTree.json').toString();
        const employmentData = fs.readFileSync(this.decisionTreesPath +'/EmploymentDecisionTree.json').toString();
        const NDAData = fs.readFileSync(this.decisionTreesPath +'/NDADecisionTree.json').toString();
        const leaseData = fs.readFileSync(this.decisionTreesPath +'/LeaseDecisionTree.json').toString();
        const timesheetData = fs.readFileSync(this.decisionTreesPath +'/TimesheetDecisionTree.json').toString();
        const invoiceData = fs.readFileSync(this.decisionTreesPath +'/InvoiceDecisionTree.json').toString();
        const loanData = fs.readFileSync(this.decisionTreesPath +'/LoanDecisionTree.json').toString();
        const data = {
            'Consulting Contract': consultantData,
            'Employment Contract': employmentData, 
            'Lease Agreement': leaseData,
            'Loan Agreement': loanData,
            'Non-disclosure Agreement': NDAData,
            'Covid Screening': covidData,
            'Timesheet': timesheetData,
            'Invoice': invoiceData
        };

        return {status:"success", data: data, message:""};
    }
}