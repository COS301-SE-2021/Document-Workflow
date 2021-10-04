import { injectable } from "tsyringe";
import * as fs from 'fs';



@injectable()
export class AIService{
    constructor() {
    }
    classifierFilePath = 'src/ai/ClassifierData/DocumentClassifier.json';
    bayesFilePath = 'src/ai/ClassifierData/BayesClassifier.json';
    decisionTreesPath = 'src/ai/decisionTreesData';
    retrieveClassifierData(){
        const classifierData = fs.readFileSync(this.classifierFilePath).toString();
        const bayesData = fs.readFileSync(this.bayesFilePath).toString();
        return {status:"success", data: {classifierData: classifierData, bayesData: bayesData}, message:""};
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
            'Expense Report': expenseDate,
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