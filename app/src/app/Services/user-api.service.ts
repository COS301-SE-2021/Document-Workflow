import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface User {
  Fname: string;
  Lname: string;
  initials: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserAPIService {
  static url =  'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): boolean {
    return true;
  }

  public static async register(user: User): Promise<boolean> {
    const response = await fetch((UserAPIService.url).concat( '/users'), { //TODO: change this url
      method: 'POST',
      body: JSON.stringify({name:user.Fname, surname:user.Lname, initials:user.initials, email:user.email, password:user.password}),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: {'Content-Type': 'application/json; charset=UTF-8'} });

    if (!response.ok)
    {
      return false;
    }

    return true;
  }

  uploadSignature(file: File, name: string){
     //convert it to blob here

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('name', file.name);
    console.log(formData);


    this.http.post(`${UserAPIService.url}/signatures`, formData);
  }
}
