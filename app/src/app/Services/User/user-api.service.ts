import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { resolveFileWithPostfixes } from '@angular/compiler-cli/ngcc/src/utils';
import { UserNotificationsComponent } from 'src/app/components/user-notifications/user-notifications.component';
import { PopoverController } from '@ionic/angular';
import * as Cookies from 'js-cookie';
import { CoreEnvironment } from '@angular/compiler/src/compiler_facade_interface';

export interface User {
  Fname: string;
  Lname: string;
  initials: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserAPIService {
  static url = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private pop: PopoverController) {}

  public checkIfAuthorized() {
    //callback){

    const formData = new FormData();
    //const token = localStorage.getItem('token');
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    return this.http.post(
      UserAPIService.url + '/users/authenticate',
      formData,
      { headers: httpHeaders }
    );
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public register(user: User, file: File, callback) {
    const formData = new FormData();
    formData.append('name', user.Fname);
    formData.append('surname', user.Lname);
    formData.append('initials', user.initials);
    formData.append('password', user.password);
    formData.append('email', user.email);
    formData.append('signature', file);
    this.http.post(UserAPIService.url + '/users', formData).subscribe(
      (data) => {
        //TODO: change url
        if (data) {
          callback(data);
        } else
          callback({ status: 'error', message: 'Cannot connect to Server' });
      },
      (error) => {
        console.log(error);
        this.displayPopOver(
          'Error',
          'An unexpected error occurred, please try again later'
        );
      }
    );
  }

  public login(loginData: LoginData, callback) {
    console.log('Logging in a user');
    const formData = new FormData();
    formData.append('email', loginData.email);
    formData.append('password', loginData.password);
    try {
      this.http.post(UserAPIService.url + '/users/login', formData).subscribe(
        async (data) => {
          if (data) {
            callback(data);
          } else
            await this.couldNotConnectToServer();
          },
        async (error) => {
          console.log(error);
          if(error.statusText === 'Unknown Error'){
            await this.displayPopOver('Login Error', 'Could not connect to the Document Workflow Server at this time. Please try again later.');
          }
          else {
            await this.displayPopOver('Login Error', error.error);
          }
        }
      );
    } catch (e) {
      alert('An unexpected error occurred, please try again later');
    }
  }

  //for the pop over
  async displayPopOver(title: string, message: string) {
    const poper = await this.pop.create({
      component: UserNotificationsComponent,
      componentProps: {
        title: title,
        message: message,
        displayButton: false
      },
    });

    await poper.present();

    (await poper).onDidDismiss().then(async (data) => {
      return await data;
    });
  }

  async displayPopOverWithButtons(title: string, message: string, callback) {
    const poper = await this.pop.create({
      component: UserNotificationsComponent,
      componentProps: {
        title: title,
        message: message,
        displayButton: true
      },
    });

    await poper.present();

    (await poper).onDidDismiss().then(async (data) => {
      callback(data) ;
    });
  }


  // return true if email is valid else return false.
  //Can be used with register as it must return false
  async verifyEmail(email: string): Promise<boolean>{
    console.log(email);
    // const formData = new FormData();
    // //const token = localStorage.getItem('token');
    // const token = Cookies.get('token');
    // const httpHeaders: HttpHeaders = new HttpHeaders({
    //   Authorization: 'Bearer ' + token,
    // });

    // this.http
    //   .post(UserAPIService.url + '/users/verifyEmailExistence', formData, {
    //     headers: httpHeaders,
    //   })
    //   .subscribe(
    //     (data) => {
    //       //TODO: change url

    //       if (data) {
    //         console.log(data);
    //       }
    //     },
    //     async (error) => {
    //       await this.displayPopOver(
    //         'Error',
    //         'The Document Workflow server could not be reached at this time'
    //       );
    //     }
    //   );

    return true;
  }

  async getUserDetails(callback) {
    const formData = new FormData();
    //const token = localStorage.getItem('token');
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(UserAPIService.url + '/users/getDetails', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
          //TODO: change url

          if (data) {
            callback(data);
          } else
            callback({ status: 'error', message: 'Cannot connect to Server' });
        },
        async (error) => {
          await this.displayPopOver(
            'Error user-api-services - getUserDetails',
            error
          );
        }
      );
  }

  logout() {
    //TODO: call the backend logout function
    Cookies.remove('token');
  }

  private async couldNotConnectToServer() {
    await this.displayPopOver('Error', 'The Document Workflow Server could not be reached at this time, please try again later');

  }
}
