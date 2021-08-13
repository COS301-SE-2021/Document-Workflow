import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from './../User/user-api.service';
import { documentImage, phaseUser } from './../Document/document-api.service';
import * as Cookies from 'js-cookie';

export interface workflowFormat {
  currentPhase: number;
  description: string;
  name: string;
  ownerEmail: string;
  ownerId: string;
  _v: number;
  _id: string;
  phases: phaseFormat[];
}

export interface phaseFormat {
  completed?: boolean;
  annotations: string;
  description: string;
  users: phaseUserFormat[];
}

export interface phaseUserFormat {
  email: string;
  permission: string;
  accepted: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class WorkFlowService {
  static url = 'http://localhost:3000/api'; //TODO: change this url
  constructor(private http: HttpClient) {}

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public async createWorkflow(
    workflowName,
    workflowDescription,
    phases,
    document,
    callback
  ): Promise<any> {
    const formData = new FormData();
    formData.append('name', workflowName);
    formData.append('description', workflowDescription);
    formData.append('document', document);
    formData.append('phases', JSON.stringify(phases));

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(WorkFlowService.url + '/workflows', formData, {
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
        (error) => {}
      );
  }

  public async deleteWorkFlow(workflow_id, callback) {
    const formData = new FormData();
    formData.append('id', workflow_id);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(WorkFlowService.url + '/workflows/delete', formData, {
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
        (error) => {
          alert('An unexpected error occurred');
        }
      );
  }
  //TODO: promise-ify this code otherwise it will get really complicated in the frontend.
  public async getWorkFlowData(workflowId, callback) {
    const formData = new FormData();
    formData.append('id', workflowId);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(WorkFlowService.url + '/workflows/getDetails', formData, {
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
        (error) => {
          alert('An unexpected error occurred');
        }
      );
  }

  async getUserWorkflowsData(callback) {
    const formData = new FormData();
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(WorkFlowService.url + '/workflows/getUserWorkflowsData', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
          //TODO: change url
          if (data) {
            console.log(data)
            data['data'].ownedWorkflows = this.formatWorkflows(data['data'].ownedWorkflows);
            data['data'].workflows = this.formatWorkflows(data['data'].workflows);
            callback(data);
          } else
            callback({ status: 'error', message: 'Cannot connect to Server' });
        },
        (error) => {
          alert('An unexpected error occurred');
        }
      );
  }
//todo cancerous maybe but its works and will make the frontend processing so much easier
  formatWorkflows(documents: any): workflowFormat[] {
    let temp: workflowFormat[] = [];
    for (let document of documents) {
      let tempPhase: phaseFormat[] = [];
      let tmpWorkflow: workflowFormat;
      for (let phase of document.phases) {
        let tempUser: phaseUserFormat[] = [];
        let checker = true;
        for (let user of JSON.parse(phase['users'])) {
          let tmpUser: phaseUserFormat;
          tmpUser = {
            accepted: user.accepted,
            email: user.user,
            permission: user.permission,
          };
          if (tmpUser.accepted === false) {
            checker = false;
          }
          tempUser.push(tmpUser);
        }
        let tmpPhase: phaseFormat;
        tmpPhase = {
          completed: checker,
          annotations: phase['annotations'],
          description: phase['description'],
          users: tempUser,
        };
        tempPhase.push(tmpPhase);
      }
      tmpWorkflow={
        currentPhase: document['currentPhase'],
        description: document['description'],
        ownerEmail: document['ownerEmail'],
        ownerId: document['ownerId'],
        _v: document['_v'],
        _id: document['_id'],
        name: document['name'],
        phases: tempPhase,
      }
      temp.push(tmpWorkflow);
    }
    console.log(temp)
    return temp;
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
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(WorkFlowService.url + '/workflows/updateDocument', formData, {
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
        (error) => {
          alert('An unexpected error occurred');
        }
      );
  }
}
