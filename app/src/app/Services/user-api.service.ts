import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface User {
  id: number;
  Fname: string;
  Lname: string;
  initials: string;
  email: string;
  phone_number: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserAPIService {
  url = '';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): boolean {
    return true;
  }

  register(user: User): boolean {
    return true;
  }

  uploadSignature(file: File, name: string){
     //convert it to blob here

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('name', file.name);
    console.log(formData);


    this.http.post(`${this.url}/signatures`, formData);
  }
}
