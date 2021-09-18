import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as Cookies from 'js-cookie';
import {LoadingController, PopoverController} from '@ionic/angular';
import { UserNotificationsComponent } from 'src/app/components/user-notifications/user-notifications.component';
import {config} from 'src/app/Services/configuration';
export interface workflowFormat {
  showWorkflow?: boolean;
  currentPercent: number;
  currentPhase: number;
  description: string;
  name: string;
  ownerEmail: string;
  ownerId: string;
  status?: string;
  _v: number;
  _id: string;
  phases: phaseFormat[];
}

export interface phaseFormat {
  phaseNumber?: number;
  showPhase?: boolean;
  status: string;
  annotations: string;
  description: string;
  _id?: string;
  users: phaseUserFormat[];
}

export interface phaseUserFormat {
  user: string;
  permission: string;
  accepted: string;
}
@Injectable({
  providedIn: 'root',
})
export class WorkFlowService {
  // static url = 'http://localhost:3000/api'; //TODO: change this url
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

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public async createWorkflow(
    workflowName,
    workflowDescription,
    phases,
    document,
    template,
    callback
  ): Promise<any> {
    this.displayLoading();
    const formData = new FormData();
    formData.append('name', workflowName);
    formData.append('description', workflowDescription);
    formData.append('document', document);
    formData.append('phases', JSON.stringify(phases));
    if(template !== null){
      formData.append('template', JSON.stringify(template));
    }


    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/workflows', formData, {
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
        }
      );
  }

  public async deleteWorkFlow(workflowId, callback) {
    const formData = new FormData();
    formData.append('workflowId', workflowId);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/workflows/delete', formData, {
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

  public async getWorkFlowData(workflowId, callback) {
    await this.dismissLoading();
    const formData = new FormData();
    formData.append('id', workflowId);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/workflows/getDetails', formData, {
        headers: httpHeaders,
      })
      .subscribe( async (data) => {
          await this.dismissLoading();
          if (data) {
            callback(data);
          } else
            callback({ status: 'error', message: 'Cannot connect to Server' });
        },
        async (error) => {
          await this.dismissLoading();
          await this.displayPopOver('Error', 'Workflow data could not be retrieved at this time, ' +
            'please try again later');
        }
      );
  }

  async updatePhase(workflowId, accept, document, callback) {
    const formData = new FormData();
    formData.append('workflowId', workflowId);
    formData.append('accept', accept);
    formData.append('document', document);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/workflows/updatePhase', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
          if (data) {
            callback(data);
          } else
            callback({ status: 'error', message: 'Cannot connect to Server' });
        },
        (error) => {
          console.log(error);
          alert('An unexpected error occurred');
        }
      );
  }

  async retrieveDocument(workflowId, callback) {
    const formData = new FormData();
    formData.append('workflowId', workflowId);
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/workflows/retrieveDocument', formData, {
        headers: httpHeaders,
      })
      .subscribe((data) => {
        console.log(data);
        if (data != null) {
          callback(data);
        } else {
          callback({ status: 'error', message: 'Cannot connect to Server' });
        }
      });
  }

  async retrieveWorkflow(workflowId, callback) {
    const formData = new FormData();
    formData.append('workflowId', workflowId);
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/workflows/retrieveWorkflow', formData, {
        headers: httpHeaders,
      })
      .subscribe((data) => {
        if (data != null) {
          callback(data);
        } else {
          callback({ status: 'error', message: 'Cannot connect to Server' });
        }
      });
  }

  async updateCurrentPhaseAnnotations(workflowId, annotations, callback) {
    const formData = new FormData();
    formData.append('workflowId', workflowId);
    formData.append('annotations', annotations);
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(
        config.url + '/workflows/updatePhaseAnnotations',
        formData,
        {
          headers: httpHeaders,
        }
      )
      .subscribe((data) => {
        if (data != null) {
          callback(data);
        } else {
          callback({ status: 'error', message: 'Cannot connect to Server' });
        }
      });
  }

  async getUserWorkflowsData(callback) {
    const formData = new FormData();
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/workflows/getUserWorkflowsData', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
          if (data) {
            console.log(data['data'].ownedWorkflows)
            data['data'].ownedWorkflows = this.formatWorkflows(
              data['data'].ownedWorkflows
            );
            data['data'].workflows = this.formatWorkflows(
              data['data'].workflows
            );
            callback(data);
          } else
            callback({ status: 'error', message: 'Cannot connect to Server' });
        },
        (error) => {
          console.log(error);
          alert('An unexpected error occurred');
        }
      );
  }

  formatWorkflows(documents: any): workflowFormat[] {
    let temp: workflowFormat[] = [];
    for (let document of documents) {
      let tempPhase: phaseFormat[] = [];
      let tmpWorkflow: workflowFormat;
      let completedCounter: number = 0;
      for (let phase of document.phases) {
        phase = JSON.parse(phase);
        let tempUser: phaseUserFormat[] = [];
        for (let user of JSON.parse(phase['users'])) {
          let tmpUser: phaseUserFormat;
          let a: string = "true";
          if (user.accepted === 'false') {
            a = "false";
          }
          tmpUser = {
            accepted: a,
            user: user.user,
            permission: user.permission,
          };
          tempUser.push(tmpUser);
        }
        let tmpPhase: phaseFormat;
        let tmpShowPhase: boolean = false;
        if (phase['status'] === 'InProgress') {
          tmpShowPhase = true;
        } else if (phase['status'] === 'Completed') {
          completedCounter++;
        }
        tmpPhase = {
          showPhase: tmpShowPhase,
          status: phase['status'],
          annotations: phase['annotations'],
          description: phase['description'],
          users: tempUser,
        };
        tempPhase.push(tmpPhase);
      }
      let percent = completedCounter / tempPhase.length;
      tmpWorkflow = {
        showWorkflow: true,
        currentPercent: percent,
        currentPhase: document['currentPhase'],
        description: document['description'],
        ownerEmail: document['ownerEmail'],
        ownerId: document['ownerId'],
        _v: document['_v'],
        _id: document['_id'],
        name: document['name'],
        status: document['status'],
        phases: tempPhase,
      };
      temp.push(tmpWorkflow);
    }
    return temp;
  }

  public async editWorkflow(
    workflowName,
    workflowDescription,
    phases,
    workflowId,
    callback
  ) {
    console.log(phases);
    const formData = new FormData();
    formData.append('name', workflowName);
    formData.append('description', workflowDescription);
    formData.append('phases', JSON.stringify(phases));
    formData.append('workflowId', workflowId);
    //const token = localStorage.getItem('token');
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/workflows/edit', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
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

  public async revertPhase(workflowId, callback) {
    const formData = new FormData();
    formData.append('workflowId', workflowId);
    //const token = localStorage.getItem('token');
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/workflows/revertPhase', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
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

  displayLoading(){
    const loading = this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 10000
    }).then((response)=>{
      response.present();
    });
  }

  dismissLoading(){
    this.loadingCtrl.dismiss().then((response) => {
    }).catch((err) => {
    });;
  }

  /**
   * This will likely stay a test function.
   * @param workflow_id
   * @param file
   */
  public async updateDocument(documentId, file, callback) {
    const formData = new FormData();
    formData.append('documentId', documentId);
    formData.append('document', file);

    //const token = localStorage.getItem('token');
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/workflows/updateDocument', formData, {
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

  async getOriginalDocument(workflowId: string, callback) {
    const formData = new FormData();
    formData.append('workflowId', workflowId);
    //const token = localStorage.getItem('token');
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/workflows/getOriginalDocument', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
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

  async verifyDocument(hash: string, workflowId: string, callback){
    const formData = new FormData();
    formData.append('workflowId', workflowId);
    formData.append('hash', hash);
    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    this.http
      .post(config.url + '/workflows/verifyDocument', formData, {
        headers: httpHeaders,
      })
      .subscribe(
        (data) => {
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
