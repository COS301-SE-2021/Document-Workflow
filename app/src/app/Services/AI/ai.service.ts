import { Injectable } from '@angular/core';
import * as natural from 'natural';

const DOCUMENT_TYPES = Object.freeze({EXPENSE:'Expense Report', CONSULTING:'Consulting Contract', EMPLOYMENT:'Employment Contract' });

@Injectable({
  providedIn: 'root'
})
export class AIService {

    classifier;


  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.addDocumentsToClassifier();
  }
  categorizeDocument(extractedText: string){

  }

  addDocumentsToClassifier(){
    this.data.forEach(pair =>{
      this.classifier.addDocument(pair[0],pair[1]);
    })
  }
  data = [
    ['Total Meal Expense', DOCUMENT_TYPES.EXPENSE],
    ['Reimbursement Due', DOCUMENT_TYPES.EXPENSE],
    ['Processing of receipts and reimbursements may take 4-6 weeks.', DOCUMENT_TYPES.EXPENSE],
    ['Please mail your Expense Report form & original receipts', DOCUMENT_TYPES.EXPENSE],
    ['Dallas NARPM Expense Report', DOCUMENT_TYPES.EXPENSE],
    ['Itemized Expenses or Description for "Other"', DOCUMENT_TYPES.EXPENSE],
    ['TOTAL REIMBURSEMENT', DOCUMENT_TYPES.EXPENSE],
    ['Reimbursement must be approved by a Director. Please submit to the Chapter President and Treasurer', DOCUMENT_TYPES.EXPENSE],
    ['City of Portland Trip and Expense Report', DOCUMENT_TYPES.EXPENSE],
    ['Complete budget estimate prior to approval and complete actual after trip. Budget Estimate', DOCUMENT_TYPES.EXPENSE],
    ['This form does not replace the payroll reimbursement form. You must accompany this form and the payroll reimbursement form for any payroll reimbursement. A copy of this form needs to be kept on file with the department', DOCUMENT_TYPES.EXPENSE],
    ['OTHER TRAVEL EXPENSES Overnight travel requires pre-approved Travel Application', DOCUMENT_TYPES.EXPENSE],
    ['ORIGINAL RECEIPTS MUST BE ATTACHED REPORTABLE EXPENSES', DOCUMENT_TYPES.EXPENSE],
    ['expenses', DOCUMENT_TYPES.EXPENSE],
    ['expenses', DOCUMENT_TYPES.EXPENSE],
    ['expenses', DOCUMENT_TYPES.EXPENSE],
    ['expenses', DOCUMENT_TYPES.EXPENSE],

    ['expenses', DOCUMENT_TYPES.EXPENSE],
    ['expenses', DOCUMENT_TYPES.EXPENSE],


  ];
}
