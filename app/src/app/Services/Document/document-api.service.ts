/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserAPIService, User } from '../User/user-api.service';



// eslint-disable-next-line @typescript-eslint/naming-convention
export interface documentImage{
  _id: string;
  document_id: string;
  description: string;
  document_path: string;
  name: string;
  owner_email: string;
  _v: number;
  phases: phase[];
}

export interface phase{
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentAPIService {
  url='http://localhost:3000/api'; //TODO: change url
constructor(private http: HttpClient) { };

  async getDocument(doc_id: string, callback) {
    const formData = new FormData();
    formData.append('doc_id', doc_id);

    this.http.post(this.url + '/documents/retrieve', formData).subscribe(data =>{
      console.log(data);
      if(data != null) {
        callback(data);
      } else {
        callback({status:'error', message: 'Cannot connect to Server'});
      }
    }
    );
  }

  async testUploadDocument(file: File): Promise<boolean>
  {
    const formData = new FormData();
    formData.append('description', 'meow Meow Meow');
    formData.append('document', file);
    const response = await fetch(('http://localhost:3000/api/documents'), { //TODO: change this url
      method: 'POST',
      body: formData,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: {'Content-Type': 'multipart/form-data'}
    });
    //Content-Type: multipart/form-data
    //'application/json; charset=UTF-8'

    if(response.ok)
    {return true;}
    else {return false;}
  }
}
