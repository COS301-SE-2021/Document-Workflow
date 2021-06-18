import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {resolveFileWithPostfixes} from "@angular/compiler-cli/ngcc/src/utils";

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
  //.setRequestHeader("Authorization", "Bearer " +  $window.sessionStorage.token);

  public checkIfAuthorized(){//callback){
    const formData = new FormData();
    const token = localStorage.getItem('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: ('Bearer ' + token)
    });
    return this.http.post(UserAPIService.url + '/users/authenticate', formData, {headers: httpHeaders});
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public register(user: User, file: File, callback){

    const formData = new FormData();
    formData.append('name', user.Fname);
    formData.append('surname', user.Lname);
    formData.append('initials', user.initials);
    formData.append('password', user.password);
    formData.append('email', user.email);
    formData.append('signature', file);
    this.http.post(UserAPIService.url + '/users', formData).subscribe(data =>{ //TODO: change url
      if(data) {

        callback(data);
      }
      else callback({status:'error', message: 'Cannot connect to Server'});
    });
  }

  public login(loginData: LoginData , callback)
  {
    console.log('Logging in a user');
    const formData = new FormData();
    formData.append('email', loginData.email);
    formData.append('password', loginData.password);
    try {
      this.http.post(UserAPIService.url + '/users/login', formData).subscribe(data => { //TODO: change url
        if (data) {
          callback(data);
        } else callback({status: 'error', message: 'Cannot connect to Server'});
      });
    }
    catch(e){
      alert("An unexpected error occured, please try again later");
    }
  }

  public getAllWorkOwnedFlows(callback) {
    console.log('Getting all owned workflows');
    const formData = new FormData();
    //formData.append('email', email);
    const token = localStorage.getItem('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: ('Bearer ' + token)
    });

      this.http.post(UserAPIService.url + '/users/retrieveOwnedWorkflows', formData, {headers: httpHeaders}).subscribe(data => { //TODO: change url
        if (data) {
          callback(data);
        } else callback({status: 'error', message: 'Cannot connect to Server'});
        }, (error) =>{
        console.log(error);
      });
  }

  public getAllWorkFlows( callback){
    const formData = new FormData();
    console.log('Getting all normal workflows');
    const token = localStorage.getItem('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: ('Bearer ' + token)
    });

      this.http.post(UserAPIService.url + '/users/retrieveWorkflows', formData, {headers: httpHeaders}).subscribe(data => { //TODO: change url
        if (data) {
          callback(data);
        } else callback({status: 'error', message: 'Cannot connect to Server'});
      }, error =>{
      });
    }

}
