import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { User } from './../User/user-api.service';
import { documentImage } from './../Document/document-api.service';
import WorkFlow from "../../../../../src/workflow/WorkFlow";

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
  static url =  'http://localhost:3000/api';
  constructor(private http: HttpClient) {}

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public async createWorkflow(workflow_info, phases, document, callback): Promise<any>{

    const formData = new FormData();
    formData.append('name', workflow_info.name);
    formData.append('description', workflow_info.description);
    formData.append('document', document);
    formData.append('phases', phases);

    //Object.keys(users).forEach(key =>{
    //  formData.append('members', users[key]);
    //});

    const token = localStorage.getItem('token');
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
}
