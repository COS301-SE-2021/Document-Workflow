import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './../User/user-api.service';
import { documentImage } from './../Document/document-api.service';

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
  public static async createWorkflow(workflow_info, users, document): Promise<any>{

    const formData = new FormData();
    formData.append('owner_email', workflow_info.owner_email);
    formData.append('name', workflow_info.name);
    formData.append('document', document);
    formData.append('members', users);

    const response = await fetch((WorkFlowService.url).concat( '/workflows'), { //TODO: change this url
      method: 'POST',
      body: formData,
      // eslint-disable-next-line @typescript-eslint/naming-convention
    });

    return response;
  }
}
