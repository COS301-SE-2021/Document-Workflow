import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface User {
  Fname: string;
  Lname: string;
  initials: string;
  email: string;
  password: string;
}

export interface LoginData{
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

    const formData = new FormData();
    formData.append('name', user.Fname);
    formData.append('surname', user.Lname);
    formData.append('initials', user.initials);
    formData.append('password', user.password);
    formData.append('email', user.email);
    formData.append('signature', file);
    const response = await fetch((UserAPIService.url).concat( '/users'), { //TODO: change this url
      method: 'POST',
      body: formData,
      // eslint-disable-next-line @typescript-eslint/naming-convention
       });
    //Content-Type: multipart/form-data
    //'application/json; charset=UTF-8'

    if(response.ok)
    {return true;}
    else {return false;}

    /* THIS WORKS
    const formData = new FormData();
    formData.append('name', user.Fname);
    formData.append('surname', user.Lname);
    formData.append('initials', user.initials);
    formData.append('password', user.password);
    formData.append('email', user.email);
    formData.append('signature', file);
    let request = new XMLHttpRequest();

    request.open('POST', 'http://localhost:3000/api/users'); //TODO: swap out this url with environment variable.
    const response = await request.send(formData);
    //TODO: after the request is sent return the correct value
    return false;
    */
  }

  public static async login(loginData: LoginData): Promise<string>
  {

    /*const response = await fetch((UserAPIService.url).concat( '/users/login'), { //TODO: change this url
      method: 'POST',
      body: loginData,
      headers:  {'Content-Type': 'application/json; charset=UTF-8'} });*/
    const response = await fetch((UserAPIService.url).concat( '/users/login'), { //TODO: change this url
      method: 'POST',
      body: JSON.stringify({email:loginData.email, password: loginData.password}),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: {'Content-Type': 'application/json; charset=UTF-8'} });

    if(response.ok)
    {return 'Success';}
    else {return 'Failure';}
  }


}
