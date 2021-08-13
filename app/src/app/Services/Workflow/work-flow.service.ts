import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { User } from './../User/user-api.service';
import { documentImage } from './../Document/document-api.service';
import * as Cookies from 'js-cookie';

export interface Comments{
  comment: string;
  user: User;
}


export interface WorkFlow{
  name: string;
  description: string;
  documents: documentImage;
  comments: Comments[];
  users: User[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkFlowService {
  static url =  'http://localhost:3000/api'; //TODO: change this url
  constructor(private http: HttpClient) {}

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public async createWorkflow(workflowName,workflowDescription, phases, document, callback): Promise<any>{

    const formData = new FormData();
    formData.append('name', workflowName);
    formData.append('description', workflowDescription);
    formData.append('document', document);
    formData.append('phases', JSON.stringify(phases));

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: ('Bearer ' + token)
    });

    this.http.post(WorkFlowService.url + '/workflows', formData, {headers: httpHeaders}).subscribe(data => { //TODO: change url
      if (data) {
        callback(data);
      } else callback({status: 'error', message: 'Cannot connect to Server'});
    }, error =>{
    });
  }

  public async deleteWorkFlow(workflow_id, callback){
    const formData = new FormData();
    formData.append('id', workflow_id);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: ('Bearer ' + token)
    });

    this.http.post(WorkFlowService.url + '/workflows/delete', formData, {headers: httpHeaders}).subscribe(data => { //TODO: change url
      if (data) {
        callback(data);
      } else callback({status: 'error', message: 'Cannot connect to Server'});
    }, error =>{
      alert("An unexpected error occurred");
    });
  }
  //TODO: promise-ify this code otherwise it will get really complicated in the frontend.
  public async getWorkFlowData(workflowId, callback){
    const formData = new FormData();
    formData.append('id', workflowId);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: ('Bearer ' + token)
    });

    this.http.post(WorkFlowService.url + '/workflows/getDetails', formData, {headers: httpHeaders}).subscribe(data => { //TODO: change url
      if (data) {
        callback(data);
      } else callback({status: 'error', message: 'Cannot connect to Server'});
    }, error =>{
      alert("An unexpected error occurred");
    });
  }

  async getUserWorkflowsData(callback){
    const formData = new FormData();
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: ('Bearer ' + token)
    });

    this.http.post(WorkFlowService.url + '/workflows/getUserWorkflowsData', formData, {headers: httpHeaders}).subscribe(data => { //TODO: change url
      if (data) {
        callback(data);
      } else callback({status: 'error', message: 'Cannot connect to Server'});
    }, error =>{
      alert("An unexpected error occurred");
    });
  }
  /**
   * This will likely stay a test function.
   * @param workflow_id
   * @param file
   */
  public async updateDocument(document_id, file, callback) {
    const formData = new FormData();
    formData.append('documentId', document_id);
    formData.append('document', file);

    //const token = localStorage.getItem('token');
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: ('Bearer ' + token)
    });

    this.http.post(WorkFlowService.url + '/workflows/updateDocument', formData, {headers: httpHeaders}).subscribe(data => { //TODO: change url
      if (data) {
        callback(data);
      } else callback({status: 'error', message: 'Cannot connect to Server'});
    }, error => {
      alert("An unexpected error occurred");
    });
  }
}
