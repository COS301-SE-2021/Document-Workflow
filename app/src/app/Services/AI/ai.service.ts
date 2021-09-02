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
  }
  categorizeDocument(extractedText: string){

  }

}
