import { Injectable } from '@angular/core';
//import * as natural from 'natural';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {config} from '../configuration';
//import * as DecisionTree from 'decision-tree';
import {DocumentClassifier} from './BagOfWordsClassifier';
import { DecisionTree, ConsultantStrategy, CovidStrategy, EmploymentStrategy
  , ExpenseStrategy, InvoiceStrategy, LeaseStrategy, LoanStrategy,
  NDAStrategy, TimesheetStrategy, GenericStrategy} from './DecisionTree';

export const DOCUMENT_TYPES = Object.freeze({EXPENSE:'Expense Report',
  CONSULTING:'Consulting Contract',
  EMPLOYMENT:'Employment Contract',
  LEASE: 'Lease Agreement',
  LOAN: 'Loan Agreement',
  NDA: 'Non-disclosure Agreement',
  COVID: 'Covid Screening',
  TIMESHEET: 'Timesheet',
  INVOICE: 'Invoice',
  GENERIC: 'Generic'});

@Injectable({
  providedIn: 'root'
})
export class AIService {

  classifier;
  decisionTree;
  decisionTreesStrategies;

  constructor( private http: HttpClient) {
    this.loadDecisionTrees();
    this.http.get(config.url +'/ai/getClassifier').subscribe((response)=>{
      this.loadClassifier(response);
    });
    /*
    this.http.get(config.url +'/ai/getDecisionTrees').subscribe((response)=>{
        this.loadDecisionTrees(response);
    });
    */

  }

  loadClassifier(response){
    console.log(response);
    this.classifier = new DocumentClassifier();
    this.classifier.load(response.data.classifierData);
    console.log(this.classifier);
  }

  /**
   * The natural library only supports the loading of a BayesClassifier through a given filename.
   * Since we are not passing through an entire file the aim here is to copy over the important
   * data features to a newly constructed bayesclassifier to bypass this issue. Trust me this was
   * harder than it looks.
   * @param response
   *
   loadClassifier(response){
    this.classifier = new natural.BayesClassifier();
    const classifierData = JSON.parse(response.data.classifierData);
    this.classifier.docs = classifierData.docs;
    this.classifier.features = classifierData.features;
    this.classifier.events = classifierData.events;
    this.classifier.lastAdded = classifierData.lastAdded;
    this.classifier.classifier.classFeatures = classifierData.classifier.classFeatures;
    this.classifier.classifier.classTotals = classifierData.classifier.classTotals;
    this.classifier.classifier.totalExamples = classifierData.classifier.totalExamples;
    console.log('Document classifier successfully loaded');
  } */
  /*
  loadDecisionTrees(response){
    console.log(response);
    this.decisionTreesData = response.data;
    console.log(response.data);
  }*/

  loadDecisionTrees(){
    this.decisionTreesStrategies = {};
    this.decisionTreesStrategies[DOCUMENT_TYPES.CONSULTING] = new ConsultantStrategy();
    this.decisionTreesStrategies[DOCUMENT_TYPES.COVID] = new CovidStrategy();
    this.decisionTreesStrategies[DOCUMENT_TYPES.EMPLOYMENT] = new EmploymentStrategy();
    this.decisionTreesStrategies[DOCUMENT_TYPES.EXPENSE] = new ExpenseStrategy();
    this.decisionTreesStrategies[DOCUMENT_TYPES.INVOICE] = new InvoiceStrategy();
    this.decisionTreesStrategies[DOCUMENT_TYPES.LEASE] = new LeaseStrategy();
    this.decisionTreesStrategies[DOCUMENT_TYPES.LOAN] = new LoanStrategy();
    this.decisionTreesStrategies[DOCUMENT_TYPES.NDA] = new NDAStrategy();
    this.decisionTreesStrategies[DOCUMENT_TYPES.TIMESHEET] = new TimesheetStrategy();
    this.decisionTreesStrategies[DOCUMENT_TYPES.GENERIC] = new GenericStrategy();
    console.log(this.decisionTreesStrategies);
  }

  categorizeDocument(extractedText: string){
    const type = this.classifier.classify(extractedText);
    console.log('Document of type: ', type);
    return type;
  }

  identifyActionAreas(text, documentType){
    console.log("Instantiating tree of type: ", documentType);
    this.decisionTree = new DecisionTree(this.decisionTreesStrategies[documentType], documentType);
    console.log("Extracting features for documnt of type: ", documentType)
    const lines = text.toLowerCase().split('\n');
    let actionAreas = [];
    for(const line of lines){
      actionAreas.push([line, this.decisionTree.predict(line)]);
    }
    return actionAreas;
  }

  extractFeatures(text, documentType){
    let features = {};
    switch(documentType){
      case DOCUMENT_TYPES.EXPENSE: features = this.extractExpenseFeatures(text);
        break;
      case DOCUMENT_TYPES.CONSULTING: features = this.extractConsultingFeatures(text);
        break;
      case DOCUMENT_TYPES.LOAN: features = this.extractLoanFeatures(text);
        break;
      case DOCUMENT_TYPES.LEASE: features = this.extractLeaseFeatures(text);
        break;
      case DOCUMENT_TYPES.TIMESHEET: features = this.extractTimesheetFeatures(text);
        break;
      case DOCUMENT_TYPES.COVID: features = this.extractCovidFeatures(text);
        break;
      case DOCUMENT_TYPES.INVOICE:  features = this.extractInvoiceFeatures(text);
        break;
      case DOCUMENT_TYPES.NDA: features = this.extractNDAFeatures(text);
        break;
      case DOCUMENT_TYPES.EMPLOYMENT: features = this.extractEmploymentFeatures(text);
        break;
    }

    return features;
  }

  extractExpenseFeatures(content){
    content = content.toLowerCase();
    let features = {
      "Length": content.length,
      "ConsecutiveUnderscores": this.hasConsecutiveUnderscores(content),
      "NumberSemicolons": content.replace(/[^:;]/gi, '').length,
      "SignatureKeyword": (/signature/g.test(content)) || (/signatures/g.test(content)),
      "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
      "DateKeyword": (/date/g.test(content)) || (/dated/g.test(content)),
      "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))) || (/names/g.test(content)),
      "Amount": (/amount/g.test(content)),
      "Total": (/total/g.test(content)) || (/totals/g.test(content))
    };

    return features;
  }

  extractConsultingFeatures(content){
    content = content.toLowerCase();
    const features = {
      "Length": content.length,
      "ConsecutiveUnderscores": this.hasConsecutiveUnderscores(content),
      "NumberSemicolons": content.replace(/[^:]/gi, '').length,
      "SignatureKeyword": (/signature/g.test(content)),
      "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
      "ContractNoKeyword": (/contract no/g.test(content)) || (/contract #/g.test(content)),
      "ProjectNoKeyword": (/project no/g.test(content)) || (/project #/g.test(content)),
      "DateKeyword": (/date/g.test(content)),
      "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))),
      "WitnessKeyword": (/witness/g.test(content)) || (/witnesses/g.test(content)),
      "ByKeyword": (/by/g.test(content))
    };

    return features;
  }

  extractEmploymentFeatures(content){
    content = content.toLowerCase();
    let features = {
      "Length": content.length,
      "ConsecutiveUnderscores": this.hasConsecutiveUnderscores(content),
      "NumberSemicolons": content.replace(/[^:]/gi, '').length,
      "SignatureKeyword": (/signature/g.test(content)) || (/signatures/g.test(content)),
      "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
      "DateKeyword": (/date/g.test(content)) || (/dated/g.test(content)),
      "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))),
      "WitnessKeyword": (/witness/g.test(content)) || (/witnesses/g.test(content)),
      "ByKeyword": (/by/g.test(content)),
      "Employee": (/employee/g.test(content)),
      "Employeer": (/employer/g.test(content)),
      "Address": (/address/g.test(content))
    };

    return features;
  }
  extractLoanFeatures(content){
    content = content.toLowerCase();
    const features = {
      "Length": content.length,
      "ConsecutiveUnderscores": this.hasConsecutiveUnderscores(content),
      "NumberSemicolons": content.replace(/[^:]/gi, '').length,
      "SignatureKeyword": (/signature/g.test(content)),
      "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
      "Borrower": (/borrower/g.test(content)),
      "Amount": (/amount/g.test(content)),
      "DateKeyword": (/date/g.test(content)),
      "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))) || (/initials/g.test(content)),
      "WitnessKeyword": (/witness/g.test(content)) || (/witnesses/g.test(content)),
      "ByKeyword": (/by/g.test(content)),
      'AddressKeyword': (/address/g.test(content))
    };
    return features;
  }

  extractLeaseFeatures(content){
    content = content.toLowerCase();
    const features = {
      "Length": content.length,
      "ConsecutiveUnderscores": this.hasConsecutiveUnderscores(content),
      "NumberSemicolons": content.replace(/[^:]/gi, '').length,
      "SignatureKeyword": (/signature/g.test(content)),
      "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
      "Landlord": (/landlord/g.test(content)) || (/lessor/g.test(content)),
      "Tenant": (/tenant/g.test(content)) || (/lessee/g.test(content)),
      "DateKeyword": (/date/g.test(content)),
      "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))) || (/initials/g.test(content)),
      "WitnessKeyword": (/witness/g.test(content)) || (/witnesses/g.test(content)),
      "ByKeyword": (/by/g.test(content)),
      'AddressKeyword': (/address/g.test(content))
    };

    return features;
  }

  extractCovidFeatures(content){
    content = content.toLowerCase();
    const features = {
      "Length": content.length,
      "SignatureKeyword": (/signature/g.test(content)),
      "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
      "DateKeyword": (/date/g.test(content)),
      "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))),
      "Temperature": (/temperature/g.test(content)),
      "Symptoms": this.containsSymptomsKeywords(content),
      'YesOrNo': (/no/g.test(content)) || (/yes/g.test(content)),
      'IsQuestion': (/\?/g.test(content))
    };

    return features;
  }

  containsSymptomsKeywords(content){
    const bool = ( (/temperature/g.test(content)) || (/congestion/g.test(content)) || (/nausea/g.test(content))
      || (/headache/g.test(content)) || (/aches/g.test(content)) || (/cough/g.test(content)) ||(/fever/g.test(content))
      || (/fatigue/g.test(content)) || (/breathing/g.test(content)) );
    return bool;
  }

  extractNDAFeatures(content){
    content = content.toLowerCase();
    const features = {
      "Length": content.length,
      "ConsecutiveUnderscores": this.hasConsecutiveUnderscores(content),
      "NumberSemicolons": content.replace(/[^:]/gi, '').length,
      "SignatureKeyword": (/signature/g.test(content)),
      "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
      "DateKeyword": (/date/g.test(content)),
      "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))) || (/initials/g.test(content)),
      "WitnessKeyword": (/witness/g.test(content)) || (/witnesses/g.test(content)),
      "ByKeyword": (/by/g.test(content)),
    };

    return features;
  }

  extractTimesheetFeatures(content){
    content = content.toLowerCase();
    let features = {
      "Length": content.length,
      "ConsecutiveUnderscores": this.hasConsecutiveUnderscores(content),
      "NumberSemicolons": content.replace(/[^:]/gi, '').length,
      "SignatureKeyword": (/signature/g.test(content)) || (/signatures/g.test(content)),
      "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
      "DateKeyword": (/date/g.test(content)) || (/dated/g.test(content)),
      "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))),
      "Hours": (/hours/g.test(content)),
      "Total": (/total/g.test(content)) || (/totals/g.test(content))
    };

    return features;
  }

  extractInvoiceFeatures(content){
    content = content.toLowerCase();
    const features = {
      "Length": content.length,
      "ConsecutiveUnderscores": this.hasConsecutiveUnderscores(content),
      "NumberSemicolons": content.replace(/[^:]/gi, '').length,
      "SignatureKeyword": (/signature/g.test(content)) || (/signatures/g.test(content)),
      "SignKeyword": (/sign/g.test(content)) || (/signed/g.test(content)),
      "DateKeyword": (/date/g.test(content)) || (/dated/g.test(content)),
      "NameKeyword": (/name/g.test(content) || (/initial/g.test(content)) || (/title/g.test(content))),
      "Amount": (/amount/g.test(content)),
      "Total": (/total/g.test(content)) || (/totals/g.test(content)) || (/subtotal/g.test(content)),
      "Description": (/description/g.test(content))
    };

    return features;
  }

  hasConsecutiveUnderscores(content){
    const onlyUnderscores = content.replace(/[^_/.]/gi, ' ');
    const consecutives = onlyUnderscores.match(/([_/.])\1*/g);

    if(consecutives === null){
      return false;
    }
    for(let i=0;  i<consecutives.length; ++i){
      if(consecutives[i].length >= 2){
        return true;
      }
    }

    return false;
  }
}
