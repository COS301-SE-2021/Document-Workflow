import { HttpClient } from '@angular/common/http';
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
    this.http.post(UserAPIService.url + '/users/login', formData).subscribe(data =>{ //TODO: change url
      if(data) {
        callback(data);
      }
      else callback({status:'error', message: 'Cannot connect to Server'});
    });
  }

  public getAllWorkOwnedFlows(email, callback) {
    const formData = new FormData();
    formData.append('email', email);
    console.log('Getting all owned workflows');
     this.http.post(UserAPIService.url + '/users/retrieveOwnedWorkflows', formData).subscribe(data =>{ //TODO: change url
        if(data) {
          callback(data);
        }
        else callback({status:'error', message: 'Cannot connect to Server'});
     });

  }

  public getAllWorkFlows(email, callback){
    const formData = new FormData();
    formData.append('email', email);
    console.log('Getting all normal workflows');
    this.http.post(UserAPIService.url + '/users/retrieveWorkflows', formData).subscribe(data =>{ //TODO: change url
      if(data) {
        callback(data);
      }
      else callback({status:'error', message: 'Cannot connect to Server'});
    });

  }

}
