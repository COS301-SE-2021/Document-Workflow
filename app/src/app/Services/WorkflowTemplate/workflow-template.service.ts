import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {LoadingController, PopoverController} from '@ionic/angular';
import {UserNotificationsComponent} from '../../components/user-notifications/user-notifications.component';
import * as Cookies from 'js-cookie';

@Injectable({
  providedIn: 'root'
})
export class WorkflowTemplateService {

  static url = 'http://localhost:3000/api'; //TODO: change this url
  constructor(
    private http: HttpClient,
    public loadingCtrl: LoadingController,
    private pop: PopoverController
  ) {}

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

  displayLoading(){
    const loading = this.loadingCtrl.create({
      message: 'Please wait...',
    }).then((response)=>{
      response.present();
    });
  }

  dismissLoading(){
    this.loadingCtrl.dismiss().then((response) => {
    }).catch((err) => {
    });;
  }

  async getWorkflowTemplateNameAndDescription(workflowTemplateId, callback){
    this.displayLoading();
    const formData = new FormData();
    formData.append('', workflowTemplateId);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(WorkflowTemplateService.url + '/workflowTemplates/getWorkflowTemplateNameAndDescription', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
          this.dismissLoading();
          if (data) {
            callback(data);
          } else
          {callback({ status: 'error', message: 'Cannot connect to Server' });}
        },
        async (error) => {
          this.dismissLoading();
          if(error.statusText === 'Unknown Error'){
            await this.displayPopOver('Login Error', 'Could not connect to the Document Workflow Server at this time. Please try again later.');
          }
          else {
            await this.displayPopOver('Error creating new Workflow', error.error);
          }
        });
  }
  async getWorkflowTemplateData(workflowTemplateId, callback){
    this.displayLoading();
    const formData = new FormData();
    formData.append('', workflowTemplateId);


    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(WorkflowTemplateService.url + '/workflowTemplates/getWorkflowTemplateData', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
          this.dismissLoading();
          if (data) {
            callback(data);
          } else{
          callback({ status: 'error', message: 'Cannot connect to Server' });
          }
        },
        async (error) => {
          this.dismissLoading();
          if(error.statusText === 'Unknown Error'){
            await this.displayPopOver('Login Error', 'Could not connect to the Document Workflow Server at this time. Please try again later.');
          }
          else {
            await this.displayPopOver('Error creating new Workflow', error.error);
          }
        });
  }
}
