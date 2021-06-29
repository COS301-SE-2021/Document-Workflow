import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';



export interface documentImage{
  _id: string;
  name: string;
  createdDate: Date;
  url:string;
  blob: Blob;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentAPIService {
  url="http://127.0.0.1";
constructor(private http:HttpClient) { };


//maybe for the signatures
  getDocuments(){
    return this.http.get<documentImage[]>(`${this.url}/image`);
  }

}
