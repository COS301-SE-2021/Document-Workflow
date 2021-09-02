import { Injectable } from '@angular/core';
import * as natural from 'natural';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {config} from "../configuration";

const DOCUMENT_TYPES = Object.freeze({EXPENSE:'Expense Report', CONSULTING:'Consulting Contract', EMPLOYMENT:'Employment Contract' });

@Injectable({
  providedIn: 'root'
})
export class AIService {

  classifier;

  constructor( private http: HttpClient) {
    this.classifier = new natural.BayesClassifier();
    this.http.get(config.url +'/ai/getClassifier').subscribe((response)=>{
     console.log('AI Service');
     console.log(response);
     this.loadClassifier(response);
    });

  }

  /**
   * The natural library only supports the loading of a BayesClassifier through a given filename.
   * Since we are not passing through an entire file the aim here is to copy over the important
   * data features to a newly constructed bayesclassifier to bypass this issue. Trust me this was
   * harder than it looks.
   * @param response
   */
  loadClassifier(response){
    this.classifier = new natural.BayesClassifier();
    console.log(this.classifier);
    const classifierData = JSON.parse(response.data.classifierData);
    console.log(classifierData);
    this.classifier.docs = classifierData.docs;
    this.classifier.features = classifierData.features;
    this.classifier.events = classifierData.events;
    this.classifier.lastAdded = classifierData.lastAdded;
    this.classifier.classifier.classFeatures = classifierData.classifier.classFeatures;
    this.classifier.classifier.classTotals = classifierData.classifier.classTotals;
    this.classifier.classifier.totalExamples = classifierData.classifier.totalExamples;
    console.log(this.classifier);
  }

  categorizeDocument(extractedText: string){
    const type = this.classifier.classify(extractedText);
    console.log('Document of type: ', type);
    return type;
  }

}
