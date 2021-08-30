import { Injectable } from '@angular/core';
import * as tfjs from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root'
})
export class AIService {


  constructor() { 

  }

  categorizeDocument(extractedText: String){  
    console.log(tfjs);
  }
}
