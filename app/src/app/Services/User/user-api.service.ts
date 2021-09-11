import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserNotificationsComponent } from 'src/app/components/user-notifications/user-notifications.component';
import * as Cookies from 'js-cookie';
import { LoadingController, PopoverController } from '@ionic/angular';
import { config } from 'src/app/Services/configuration';
import { Logger } from '../Logger';
import { NativeBiometric } from "capacitor-native-biometric";

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
  constructor(
    private http: HttpClient,
    private pop: PopoverController,
    public loadingCtrl: LoadingController,
    private logger: Logger
  ) {}

  displayLoading() {
    const loading = this.loadingCtrl
      .create({
        message: 'Please wait...',
      })
      .then((response) => {
        response.present();
      });
  }

  dismissLoading() {
    this.loadingCtrl
      .dismiss()
      .then((response) => {})
      .catch((err) => {});
  }

  public checkIfAuthorized() {
    //callback){

    const formData = new FormData();
    //const token = localStorage.getItem('token');
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    return this.http.post(config.url + '/users/authenticate', formData, {
      headers: httpHeaders,
    });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public register(user: User, confirmPassword: string, file: File, callback) {
    //this.displayLoading();
    const formData = new FormData();
    formData.append('name', user.Fname);
    formData.append('surname', user.Lname);
    formData.append('initials', user.initials);
    formData.append('password', user.password);
    formData.append('confirmPassword', user.password);
    formData.append('email', user.email);
    formData.append('signature', file);
    this.http.post(config.url + '/users', formData).subscribe(
      (data) => {
        //this.dismissLoading();
        if (data) {
          callback(data);
        } else
          callback({ status: 'error', message: 'Cannot connect to Server' });
      },
      (error) => {
        console.log(error);
        //this.dismissLoading();
        this.displayPopOver('Error', error.error);
      }
    );
  }

  public login(loginData: LoginData, callback) {
    console.log('Logging in a user');
    const formData = new FormData();
    formData.append('email', loginData.email);
    formData.append('password', loginData.password);
    try {
      this.http.post(config.url + '/users/login', formData).subscribe(
        async (data) => {
          if (data) {
            callback(data);
          } else await this.couldNotConnectToServer();
        },
        async (error) => {
          console.log(error);
          if (error.statusText === 'Unknown Error') {
            await this.displayPopOver(
              'Login Error',
              'Could not connect to the Document Workflow Server at this time. Please try again later.'
            );
          } else {
            await this.displayPopOver('Login Error', error.error);
          }
        }
      );
    } catch (e) {
      alert('An unexpected error occurred, please try again later');
    }
  }

  async getTemplateIDs(callback) {
    try {
      const formData = new FormData();
      const token = Cookies.get('token');
      const httpHeaders: HttpHeaders = new HttpHeaders({
        Authorization: 'Bearer ' + token,
      });
      this.http
        .post(config.url + '/users/getWorkflowTemplatesIds', formData, {
          headers: httpHeaders,
        })
        .subscribe(async (response) => {
          callback(response);
        });
    } catch (error) {
      await this.displayPopOver('Template ID Error', error.error);
    }
  }

  //for the pop over
  async displayPopOver(title: string, message: string) {
    const poper = await this.pop.create({
      component: UserNotificationsComponent,
      componentProps: {
        title: title,
        message: message,
        displayButton: false,
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
        displayButton: true,
      },
    });

    await poper.present();

    (await poper).onDidDismiss().then(async (data) => {
      callback(data);
    });
  }

  // return true if email is valid else return false.
  //Can be used with register as it must return false
  async verifyEmail(email: string): Promise<boolean> {
    console.log(email);
    // const formData = new FormData();
    // //const token = localStorage.getItem('token');
    // const token = Cookies.get('token');
    // const httpHeaders: HttpHeaders = new HttpHeaders({
    //   Authorization: 'Bearer ' + token,
    // });

    // this.http
    //   .post(config.url + '/users/verifyEmailExistence', formData, {
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
      .post(config.url + '/users/getDetails', formData, {
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
  public async deleteContact(contactId, callback) {
    const formData = new FormData();
    formData.append('contactId', contactId);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http.post(config.url + '/users/deleteContact', formData, {
        headers: httpHeaders,})
      .subscribe(
        (data) => {
          //TODO: change url
          if (data) {
            callback(data);
          } else
            {callback({ status: 'error', message: 'Cannot connect to Server' });}
        },
        (error) => {
          alert('An unexpected error occurred');
        }
      );
  }


public async rejectContactRequest(callback)
{
  const formData = new FormData();
  const token = Cookies.get('token');
  const httpHeaders: HttpHeaders = new HttpHeaders({
    Authorization: 'Bearer ' + token,
  });

  this.http.post(config.url + '/users/rejectContactRequest', formData, {
    headers: httpHeaders,})
    .subscribe(
      (data) => {
        if (data) {
          callback(data);
        } else
        {callback({ status: 'error', message: 'Cannot connect to Server' });}
      },
      (error) => {
        alert('An unexpected error occurred');
      }
    );
}

public async sendContactRequest(contactId, callback)
{
  const formData = new FormData();
  formData.append('contactId', contactId);

  const token = Cookies.get('token');
  const httpHeaders: HttpHeaders = new HttpHeaders({
    Authorization: 'Bearer ' + token,
  });

  this.http.post(config.url + '/users/deleteContact', formData, {
    headers: httpHeaders,})
    .subscribe(
      (data) => {
        //TODO: change url
        if (data) {
          callback(data);
        } else
        {callback({ status: 'error', message: 'Cannot connect to Server' });}
      },
      (error) => {
        alert('An unexpected error occurred');
      }
    );
}

public blockUser(contactId, callback)
{
  const formData = new FormData();
  formData.append('contactId', contactId);

  const token = Cookies.get('token');
  const httpHeaders: HttpHeaders = new HttpHeaders({
    Authorization: 'Bearer ' + token,
  });

  this.http.post(config.url + '/users/blockUser', formData, {
    headers: httpHeaders,})
    .subscribe(
      (data) => {
        //TODO: change url
        if (data) {
          callback(data);
        } else
        {callback({ status: 'error', message: 'Cannot connect to Server' });}
      },
      (error) => {
        alert('An unexpected error occurred');
      }
    );
}
  public unblockUser(contactId, callback)
  {
    const formData = new FormData();
    formData.append('contactId', contactId);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http.post(config.url + '/users/unblockUser', formData, {
      headers: httpHeaders,})
      .subscribe(
        (data) => {
         if (data) {
            callback(data);
          } else
          {callback({ status: 'error', message: 'Cannot connect to Server' });}
        },
        (error) => {
          alert('An unexpected error occurred');
        }
      );
  }

  logout() {
    //TODO: call the backend logout function
  logout(callback) {
    const formData = new FormData();
    //const token = localStorage.getItem('token');
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/users/logout', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
          console.log(data);
          Cookies.remove('token');
          callback();
        },
        async (error) => {
          await this.displayPopOver('Logout error', error.error);
        }
      );
  }

  getContacts(callback) {
    const formData = new FormData();
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    this.http
      .post(config.url + '/users/getContacts', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
          console.log(data);
          callback(data);
        },
        async (error) => {
          await this.displayPopOver('Logout error', error.error);
        }
      );
  }

  getContactRequests(callback) {
    const formData = new FormData();
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    this.http
      .post(config.url + '/users/getContactRequests', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
          callback(data);
        },
        async (error) => {
          await this.displayPopOver('Logout error', error.error);
        }
      );
  }

  acceptContactRequest(contactid, callback) {
    const formData = new FormData();
    formData.append('contactemail', contactid);
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    this.http
      .post(config.url + '/users/getContactRequests', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
          callback(data);
        },
        async (error) => {
          await this.displayPopOver('Logout error', error.error);
        }
      );
  }



  private async couldNotConnectToServer() {
    await this.displayPopOver(
      'Error',
      'The Document Workflow Server could not be reached at this time, please try again later'
    );
  }
}
