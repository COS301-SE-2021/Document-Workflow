/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserAPIService, User } from '../User/user-api.service';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface documentImage {
  _id?: string;
  currentPhase: number;
  description: string;
  name: string;
  ownerEmail: string;
  _v?: number;
  phases: phase[];
}

export interface phase {
  completed: boolean;
  annotations: string;
  description: string;
  phaseUsers: phaseUser[];
  _v?: number;
}

export interface phaseUser {
  completed: boolean;
  email: string;
  permission: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentAPIService {
  url = 'http://localhost:3000/api'; //TODO: change url
  constructor(private http: HttpClient) {}

  async getDocument(doc_id: string, callback) {
    const formData = new FormData();
    formData.append('doc_id', doc_id);

    this.http
      .post(this.url + '/documents/retrieve', formData)
      .subscribe((data) => {
        console.log(data);
        if (data != null) {
          callback(data);
        } else {
          callback({ status: 'error', message: 'Cannot connect to Server' });
        }
      });
  }

  async testUploadDocument(file: File): Promise<boolean> {
    const formData = new FormData();
    formData.append('description', 'meow Meow Meow');
    formData.append('document', file);
    const response = await fetch('http://localhost:3000/api/documents', {
      //TODO: change this url
      method: 'POST',
      body: formData,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    //Content-Type: multipart/form-data
    //'application/json; charset=UTF-8'

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  }

  createTestDocuments(): documentImage {
    let e: phaseUser;
    e = {
      completed: false,
      email: 'brenton.stroberg@yahoo.co.za',
      permission: 'sign',
    };

    let f: phaseUser;
    f = {
      completed: true,
      email: 'timothyhill202@gmail.com',
      permission: 'view',
    };

    let g: phaseUser;
    g = {
      completed: false,
      email: 'delaray.botha@gmail.com',
      permission: 'sign'
    };

    let b: phase;
    b = {
      completed: true,
      annotations: 'wfrnuiwrfbihwrvbihfwrebiuhwrfegwirfuygb',
      description: 'phase 1',
      phaseUsers: [f, g],
    };

    let c: phase;
    c = {
      completed: false,
      annotations: 'dfbnhjiesfbdhdbfkjdbskjnbdvsfujbnrsfkjbsedkfrj',
      description: 'phase 2',
      phaseUsers: [e],
    };
    let d: phase;
    d={
      completed: false,
      annotations: 'wbihjfbwhbfrwhbf',
      description: 'phase 3',
      phaseUsers: [f, g],
    }

    let a: documentImage;
    a = {
      currentPhase:0,
      description: 'this is just for testing',
      name: 'hello',
      ownerEmail: 'brenton.stroberg@yahoo.co.za',
      _v: 1,
      _id:'jfhnrweiuwrfbniujfowerbio',
      phases:[b,c,d]
    };
    return a;
  }
}
