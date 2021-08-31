import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import * as Cookies from 'js-cookie';
import {config} from 'src/app/Services/configuration'
@Injectable({
  providedIn: 'root',
})
export class WorkflowHistoryService {
  constructor(
    private http: HttpClient,
    private loadingCtrl: LoadingController
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

  async getHistory(workflowID: string, callback) {
    const formData = new FormData();
    formData.append('workflowId', workflowID);
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    let url = config.url+'/workflows/getWorkflowHistory';
    this.http.post(url, formData,{ headers: httpHeaders}).subscribe(
      (response)=>{
        if(response){
        callback(response);
      }else{
        callback({status:'error',message:'Cannot connect to server'});
      }
      },(error)=>{
        console.error(error);
      }
    )
  }
}

