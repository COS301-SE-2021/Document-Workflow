import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {resolveFileWithPostfixes} from "@angular/compiler-cli/ngcc/src/utils";
import { UserNotificationsComponent } from 'src/app/components/user-notifications/user-notifications.component';
import { PopoverController } from '@ionic/angular';

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
          console.log('in user-api.service.ts');
          console.log(data);
          callback(data);
        } else callback({status: 'error', message: 'Cannot connect to Server'});
      });
    }
    catch(e){
      console.log('Caught an http.post error');
      console.log(e);
    }
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


}
