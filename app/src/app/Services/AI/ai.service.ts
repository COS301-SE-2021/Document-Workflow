import { Injectable } from '@angular/core';
//import * as natural from 'natural';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {config} from "../configuration";

const DOCUMENT_TYPES = Object.freeze({EXPENSE:'Expense Report', CONSULTING:'Consulting Contract', EMPLOYMENT:'Employment Contract' });

@Injectable({
  providedIn: 'root'
})
export class AIService {

  classifier;

  constructor( private http: HttpClient) {

  }

  loadClassifier(response){

  }

  categorizeDocument(extractedText: string){

  }

}
