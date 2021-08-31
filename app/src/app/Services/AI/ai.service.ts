import { Injectable } from '@angular/core';
import * as natural from 'natural';
import {DOCUMENT} from "@angular/common";

const DOCUMENT_TYPES = Object.freeze({EXPENSE:'Expense Report', CONSULTING:'Consulting Contract', EMPLOYMENT:'Employment Contract' });

@Injectable({
  providedIn: 'root'
})
export class AIService {

    classifier;


  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.addDocumentsToClassifier();
    this.classifier.train();
  }
  categorizeDocument(extractedText: string){
      alert(this.classifier.classify(extractedText));
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
    ['Foreign Travel Expense Report', DOCUMENT_TYPES.EXPENSE],
    ['Travel Expense Report of Date', DOCUMENT_TYPES.EXPENSE],
    ['When submitting travel expense report, please ensure the following are met', DOCUMENT_TYPES.EXPENSE],
    ['If requesting a reimbursement for mileage charges, check with the Business Office for the current mileage reimbursement rate.', DOCUMENT_TYPES.EXPENSE],
    ['Refer to the HWS Travel Expense Reimbursement Guidelines for specific guidance on reimbursement of various expenses.', DOCUMENT_TYPES.EXPENSE],
    ['Expense Report for Non-Employees', DOCUMENT_TYPES.EXPENSE],
    ['Expense Totals: Advances Received: Balance due Employee: Balance due NYIT: I certify that the above expenses were incurred in accordance with applicable NYIT procedures and were directly related to my official duties at NYIT.', DOCUMENT_TYPES.EXPENSE],

    ['ARCHITECT-CONSULTANT CONTRACT THIS AGREEMENT, Made as of (Current Date), In the Year of (Current Year), Between the Designer/Architect:', DOCUMENT_TYPES.CONSULTING],
    ['Based upon the program and project layout the consultant shall provide professional Structural Engineering and Design, Civil Engineering and Design, Electrical Design, HVAC Design, Landscape Design, Interior Design, Site Survey, Geotechnical Engineering, Acoustical Design, Lighting Design, Kitchen Design services as required for the project. The designer/architect shall coordinate the exchange of information between related consultants and provide timely feedback to facilitate consultant needs.', DOCUMENT_TYPES.CONSULTING],
    ['The consultant shall serve as an independent contractor, solely responsible for means and methods in completing the consultant’s services. The consultant is not and will not serve as an agent, partner or employee of the designer/architect ARTICLE CONSULTANT RESPONSIBILITIES', DOCUMENT_TYPES.CONSULTING],
    ['Reimbursable Expenses are in addition to the compensation for the basic services rendered, such as additional sets of blueprints, long distance communication, postage and handling of Drawings or any other items requested by the designer/architect.', DOCUMENT_TYPES.CONSULTING],
    ['INDEPENDENT CONTRACTOR AGREEMENT', DOCUMENT_TYPES.CONSULTING],
    ['This Independent Contractor and Confidentiality Agreement (this “Agreement”) is entered into as of the date of the last signature below (the “Effective Date”), by and between Michaels Stores Procurement Company, Inc., a Delaware corporation, having its principal office at 8000 Bent Branch Drive, Irving, Texas (“Michaels”), and , having his/her principal office at (“Instructor”).', DOCUMENT_TYPES.CONSULTING],
    ['Instructor is an independent contractor, and this Agreement shall not be construed to create any association, partnership, joint venture, employee or agency relationship between Instructor and Michaels for any purpose.', DOCUMENT_TYPES.CONSULTING],
    ['JOB TITLE: CONSULTANT-CONTRACT MANAGEMENT', DOCUMENT_TYPES.CONSULTING],
    ['The consultant shall support and coordinate the following activities of the PPP cell', DOCUMENT_TYPES.CONSULTING],
    ['Consultant-Contract Management who would be reporting to Joint Director Monitoring & Evaluation (PPP Cell), at the Directorate of Medical Health & Family Welfare, Uttarakhand, Dehradun.', DOCUMENT_TYPES.CONSULTING],
    ['Work closely with the Consultant', DOCUMENT_TYPES.CONSULTING],
    ['If your contract amount does not take the consultant’s total over $65,000.00, then you may proceed with this “short form” agreement process.', DOCUMENT_TYPES.CONSULTING],
    ['$65,000.00 is the maximum amount for any individual consultant providing any type of service during the fiscal year via one or multiple agreements to one or multiple sites or departments throughout the PUSD', DOCUMENT_TYPES.CONSULTING],
    ['If consultant does not have his/her own invoice, the Consultant Request for Payment form must be used.', DOCUMENT_TYPES.CONSULTING],
    ['CONSULTANT NAME', DOCUMENT_TYPES.CONSULTING],
    ['INDEPENDENT CONSULTANT ON- CALL CONTRACT FOR', DOCUMENT_TYPES.CONSULTING],
    ['Contract # Consultant Name/Company:', DOCUMENT_TYPES.CONSULTING],
    ['Consultant’s qualifications were evaluated by the City using a competitive selection process and Consultant is deemed highly qualified to render the desired services', DOCUMENT_TYPES.CONSULTING],
    ['The Consultant’s Services. The Consultant shall provide the General Consulting Services (“Services”) as set forth in Exhibit A, Scope of Services.', DOCUMENT_TYPES.CONSULTING],
    ['The Consultant understands, acknowledges and agrees that the work product from this Contract may be utilized and incorporated into the design and construction of a public works project, but if so incorporated, under the seal of the project’s design professional.', DOCUMENT_TYPES.CONSULTING],

    ['Contract of Employment Strictly private and confidential Entered into between (Name of company) (Herein after also referred to as "the employer" or "the company")', DOCUMENT_TYPES.EMPLOYMENT],
    ['The terms and conditions set out herein will constitute the employee\'s contract with the company with effect from __________________. Where a basic condition of employment is not specifically mentioned, the relevant legislation will be applicable (eg. the Basic Conditions of Employment Act, Act 75 of 1997, the Labour Relations Act, Act 66 of 1995 amendments to legislation etc.).', DOCUMENT_TYPES.EMPLOYMENT],
    ['This contract of employment may be terminated only on notice of not less than one week, if the employee has been employed for six months or less', DOCUMENT_TYPES.EMPLOYMENT],
    ['Remuneration The employee\'s total monthly remuneration will be R______________, payable in arrears on the 3rd last working day of each month', DOCUMENT_TYPES.EMPLOYMENT],
    ['Basic salary R Total The following will be deducted from the salary PAYE UIF Benefits', DOCUMENT_TYPES.EMPLOYMENT],
    ['Annual Bonus at Company Discretion Profit Sharing Annual salary negotiation Remuneration will be revised on an annual basis. Working hours', DOCUMENT_TYPES.EMPLOYMENT],
    ['Lunch breaks are not included in this calculation. Hours of work in terms of item 5.2 may be extended by up to fifteen (15) minutes a day', DOCUMENT_TYPES.EMPLOYMENT],
    ['Limit on overtime The employee may be permitted or requested to work overtime from time to time when needed, provided that the daily overtime shall not exceed three', DOCUMENT_TYPES.EMPLOYMENT],
    ['EMPLOYMENT AGREEMENT This Casual Employment Agreement (the „Agreement”) dated this day of between:(the “Employer”) and: the “Employee”).', DOCUMENT_TYPES.EMPLOYMENT],
    ['POSITION Employer will employ Employee in the following position ("Position"). Employee will be responsible for the following duties:', DOCUMENT_TYPES.EMPLOYMENT],
    ['The Employer may change these duties and responsibilities during the course of the Employee’s employment after consultation with the Employee.', DOCUMENT_TYPES.EMPLOYMENT],
    ['During this probationary period, Employer may terminate the employment relationship at any time, for any reason, in Employer\'s sole and exclusive discretion, with or without notice.', DOCUMENT_TYPES.EMPLOYMENT],
    ['In consideration for the Employee\'s performance of the Employee\'s Duties in accordance with this Agreement, the Employer agrees to pay the Employee the following compensation', DOCUMENT_TYPES.EMPLOYMENT],
    ['If Employee does not utilize all vacation time alloted in one year, Employee will be entitled to rollover the vacation time to the next year.', DOCUMENT_TYPES.EMPLOYMENT],
    ['Employer may terminate this Agreement at any time, with or without notice, for any reason or no reason at all. Employer does not need cause to terminate Employee\'s employment.', DOCUMENT_TYPES.EMPLOYMENT],
    ['PAY AND COMPENSATION The Parties hereby agree that the Employer will pay the Employee an annual salary of  payable semi-monthly and subject to regular deductions and withholdings as required by law.', DOCUMENT_TYPES.EMPLOYMENT],
    ['The Parties hereby agree that the Employer will pay the Employee an annual salary of payable semi-monthly and subject to regular deductions and withholdings as required by law.', DOCUMENT_TYPES.EMPLOYMENT],
    ['The Parties hereby agree that the Employee shall receive the benefits (Insurance, Holiday and Vacation) provided by the Employer as indicated below.', DOCUMENT_TYPES.EMPLOYMENT],
  ];
}
