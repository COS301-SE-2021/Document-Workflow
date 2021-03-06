import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, PopoverController } from '@ionic/angular';
import { UserNotificationsComponent } from '../../components/user-notifications/user-notifications.component';
import * as Cookies from 'js-cookie';
import { config } from 'src/app/Services/configuration';
import { phaseFormat } from '../Workflow/work-flow.service';
import { phaseUser } from '../Document/document-api.service';

export interface templateDescription {
  templateID: string;
  templateName: string;
  templateDescription: string;
}

export interface Template {
  documentName: string;
  templateOwnerEmail: string;
  templateOwnerId: string;
  workflowName: String;
  WorkflowDescription: string;
  _id: string;
  phases: templatePhase[];
}

export interface templatePhase {
  status: string;
  annotations: string;
  users: templatePhaseUser;
}

export interface templatePhaseUser {
  user: string;
  permissions: string;
  accepted: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class WorkflowTemplateService {
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
        displayButton: false,
      },
    });

    await poper.present();

    (await poper).onDidDismiss().then(async (data) => {
      return await data;
    });
  }

  async deleteWorkflowTemplate(workflowTemplateId, callback) {
    await this.displayLoading();
    const formData = new FormData();
    formData.append('templateId', workflowTemplateId);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    let url = config.url + '/workflowTemplates/delete';
    this.http.post(url, formData, { headers: httpHeaders }).subscribe(
      async (data) => {
        this.dismissLoading();
        if (data) {
          callback(data);
        } else {
          callback({ status: 'error', message: 'Cannot connect to Server' });
        }
      },
      async (error) => {
        this.dismissLoading();
        if (error.statusText === 'Unknown Error') {
          await this.displayPopOver(
            'Login Error',
            'Could not connect to the Document Workflow Server at this time. Please try again later.'
          );
        } else {
          await this.displayPopOver('Error deleting Workflow Template', error.error);
        }
      }
    );
  }

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

  async getWorkflowTemplateNameAndDescription(workflowTemplateId, callback) {
    const formData = new FormData();
    formData.append('workflowTemplateId', workflowTemplateId);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    let url =
      config.url + '/workflowTemplates/getWorkflowTemplateNameAndDescription';
    this.http.post(url, formData, { headers: httpHeaders }).subscribe(
      async (data) => {
        if (data) {
          callback(data);
        } else {
          callback({ status: 'error', message: 'Cannot connect to Server' });
        }
      },
      async (error) => {
        if (error.statusText === 'Unknown Error') {
          await this.displayPopOver(
            'Login Error',
            'Could not connect to the Document Workflow Server at this time. Please try again later.'
          );
        } else {
          await this.displayPopOver('Error creating new Workflow', error.error);
        }
      }
    );
  }
  async getWorkflowTemplateData(workflowTemplateId, callback) {
    this.displayLoading();
    const formData = new FormData();
    formData.append('workflowTemplateId', workflowTemplateId);

    const token = Cookies.get('token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    let url = config.url + '/workflowTemplates/getWorkflowTemplateData';
    this.http.post(url, formData, { headers: httpHeaders }).subscribe(
      async (data) => {
        if (data) {
          data['template']['phases'] = this.formatPhases(
            data['template']['phases']
          );

          this.dismissLoading();
          callback(data);
        } else {
          this.dismissLoading();
          callback({ status: 'error', message: 'Cannot connect to Server' });
        }
      },
      async (error) => {
        this.dismissLoading();
        if (error.statusText === 'Unknown Error') {
          await this.displayPopOver(
            'Login Error',
            'Could not connect to the Document Workflow Server at this time. Please try again later.'
          );
        } else {
          await this.displayPopOver('Error Template Workflow', error.error);
        }
      }
    );
  }

  formatPhases(arr: string): phaseFormat[] {
    let phases: phaseFormat[] = [];
    for (let phase of JSON.parse(arr)) {
      let tempUser: phaseUser[] = [];
      tempUser = JSON.parse(phase['users']);
      phase.users = tempUser;
      phases.push(phase);
    }
    return phases;
  }
}

