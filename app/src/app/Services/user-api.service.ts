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

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public static async register(user: User, file: File): Promise<boolean> {
    /*
    const formData = new FormData();
    formData.append('data',
      JSON.stringify({name:user.Fname, surname:user.Lname, initials:user.initials, email:user.email, password:user.password, signature:file}));
    const response = await fetch((UserAPIService.url).concat( '/users'), { //TODO: change this url
      method: 'POST',
      body: formData,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: {'Content-Type': 'multipart/form-data'} });
    //Content-Type: multipart/form-data
    //'application/json; charset=UTF-8'
    */
    const formData = new FormData();
    formData.append('name', user.Fname);
    formData.append('surname', user.Lname);
    formData.append('initials', user.initials);
    formData.append('password', user.password);
    formData.append('email', user.email);
    formData.append('signature', file);
    let request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:3000/api/users'); //TODO: swap out this url with environment variable.
    request.send(formData);
    return false;
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
