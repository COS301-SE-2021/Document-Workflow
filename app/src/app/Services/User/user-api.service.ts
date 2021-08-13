import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {resolveFileWithPostfixes} from "@angular/compiler-cli/ngcc/src/utils";
import { UserNotificationsComponent } from 'src/app/components/user-notifications/user-notifications.component';
import { PopoverController } from '@ionic/angular';
import * as Cookies from 'js-cookie';

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

  constructor(
    private http: HttpClient,
    private pop: PopoverController
  ) {}

  public checkIfAuthorized(){//callback){
    const formData = new FormData();
    //const token = localStorage.getItem('token');
    const token = Cookies.get('token');
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
    }, (error)=>{
      console.log(error);
      this.displayPopOver("Error", "An unexpected error occurred, please try again later");
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
      }, (error)=>{
        this.displayPopOver('Error user-api-services - login', error);
      });
    }
    catch(e){
      alert("An unexpected error occured, please try again later");
    }
  }

  //for the pop over
  async displayPopOver(title: string, message: string){
    const poper = await this.pop.create({
      component: UserNotificationsComponent,
      componentProps:{
        'title': title,
        'message': message
      }
    });
    await poper.present();

    const a = await poper.onDidDismiss();
    console.log( a );
  }

  async getUserDetails(callback){
    const formData = new FormData();
    //const token = localStorage.getItem('token');
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: ('Bearer ' + token)
    });

    this.http.post(UserAPIService.url + '/users/getDetails', formData, {headers: httpHeaders}).subscribe(data => { //TODO: change url

      if (data) {
        callback(data);
      } else callback({status: 'error', message: 'Cannot connect to Server'});
    }, async error =>{
      await this.displayPopOver('Error user-api-services - getUserDetails', error);
    });
  }

  logout(){
    //localStorage.removeItem('token');
    Cookies.remove('token');
  }

}
