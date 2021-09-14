import { Injectable } from '@angular/core';
import * as natural from 'natural';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {config} from '../configuration';
import * as DecisionTree from 'decision-tree';
import {DocumentClassifier} from './BagOfWordsClassifier';

const DOCUMENT_TYPES = Object.freeze({EXPENSE:'Expense Report', 
        CONSULTING:'Consulting Contract', 
        EMPLOYMENT:'Employment Contract',
        LEASE: 'Lease Agreement',
        LOAN: 'Loan Agreement',
        NDA: 'Non-disclosure Agreement',
        COVID: 'Covid Screening',
        TIMESHEET: 'Timesheet',
        INVOICE: 'Invoice' });

@Injectable({
  providedIn: 'root'
})
export class AIService {

  classifier;
  decisionTree;
  decisionTreesData;

  constructor( private http: HttpClient) {
    this.http.get(config.url +'/ai/getClassifier').subscribe((response)=>{
     this.loadClassifier(response);
    });

    this.http.get(config.url +'/ai/getDecisionTrees').subscribe((response)=>{
        this.loadDecisionTrees(response);
    });
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

  loadDecisionTrees(response){
    console.log(response);
    this.decisionTree = new DecisionTree(JSON.parse(response.data.consultantData));
    console.log(this.decisionTree);
    console.log(this.decisionTree.predict({
      'Length': 36,
      'ConsecutiveUnderscores': false,
      'ContainsSemiColon': false,
      'SignatureKeyword': false,
      'ProjectNoKeyWord': false,
      'DateKeyword': false,
      'NameKeyword': false,
      'WitnessKeyword': false
    }));
  }

  categorizeDocument(extractedText: string){
    const type = this.classifier.classify(extractedText);
    console.log('Document of type: ', type);
    return type;
  }

  identifyActionAreas(text, documentType){
      const features = this.extractFeatures(text, documentType);
      console.log(features);

  }

  extractFeatures(text, documentType){
    let features = {};
      switch(documentType){
        case DOCUMENT_TYPES.EXPENSE: console.log("Extracting features for document of type: EXPENSE" );
        break;  
        case DOCUMENT_TYPES.CONSULTING: console.log("Extracting features for document of type: CONSULTING" );
        break;
        case DOCUMENT_TYPES.LOAN: console.log("Extracting features for document of type: LOAN" );
        break;
        case DOCUMENT_TYPES.LEASE: console.log("Extracting features for document of type: LEASE" );
        break;
        case DOCUMENT_TYPES.TIMESHEET: console.log("Extracting features for document of type: TIMESHEET" );
        break;
        case DOCUMENT_TYPES.COVID: console.log("Extracting features for document of type: COVID" );
        break;
        case DOCUMENT_TYPES.INVOICE: console.log("Extracting features for document of type: INVOICE" );
        break;
        case DOCUMENT_TYPES.NDA: console.log("Extracting features for document of type: NDA" );
        break;
        case DOCUMENT_TYPES.EMPLOYMENT: console.log("Extracting features for document of type: EMPLOYMENT" );
        break;
      }

      return features;
  }
}
