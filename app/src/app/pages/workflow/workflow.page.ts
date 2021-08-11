/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IonReorderGroup, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

//interface and services
import { User, UserAPIService } from './../../Services/User/user-api.service';
import {
  documentImage,
  DocumentAPIService,
} from './../../Services/Document/document-api.service';
import { WorkFlowService } from '../../Services/Workflow/work-flow.service';
import { ConfirmDeleteWorkflowComponent } from 'src/app/components/confirm-delete-workflow/confirm-delete-workflow.component';
import { ItemReorderEventDetail } from '@ionic/core';
import * as Cookies from 'js-cookie';
@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.page.html',
  styleUrls: ['./workflow.page.scss'],
})
export class WorkflowPage implements OnInit {
  public title = 'Home Page';
  documents: documentImage[] = [];
  ownerEmail: string;
  user: User;
  reOrder: boolean;
  isBrowser: boolean;

  // eslint-disable-next-line @typescript-eslint/member-ordering

  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  constructor(
    private docService: DocumentAPIService,
    private modals: ModalController,
    private plat: Platform,
    private router: Router,
    private userApiService: UserAPIService,
    private workFlowService: WorkFlowService,
    private loadctrl: LoadingController,
    private navControl: NavController
  ) {
    this.title="Home";
  }

  async ngOnInit() {
    this.reOrder = true;

    if(this.plat.is('desktop')){
      //alert("here");
      console.log('Desktop');
    }

    const load = await this.loadctrl.create({
      message: 'Hang in there... we are almost done',
      duration: 5000,
      showBackdrop: false,
      spinner: 'bubbles'
    });
    await load.present();
    //if(localStorage.getItem('token') === null) {
    if(Cookies.get('token') === undefined){
      await this.router.navigate(['/login']);
      await load.dismiss();
      return;
    }
    else
    {
      this.userApiService.checkIfAuthorized().subscribe((response) => {
        console.log("Successfully authorized user");
      }, async (error) => {
        console.log(error);
        await this.router.navigate(['/login']);
        await load.dismiss();
        return;
      });
    }
    await this.getUser();
    await this.loadWorkFlows();
    await load.dismiss();
  }

  async getUser(){
    this.userApiService.getUserDetails(async (response)=>{
      if(response){
        this.user = response.data;
        this.ownerEmail = this.user.email;
      } else{
        this.userApiService.displayPopOver('Error', 'Cannot find user')
      }
    })
  }

  async deleteWorkFlow(id: string){
    const deleteMod = this.modals.create({
      component: ConfirmDeleteWorkflowComponent
    });

    (await deleteMod).present();
    (await deleteMod).onDidDismiss().then(async (data) => {
      const result = (await data).data['confirm'];
      if (result){
        this.workFlowService.deleteWorkFlow(id, (response) =>{
          console.log(response);
          this.userApiService.displayPopOver("Deletion of workflow", 'Workflow has been successfully deleted');
        });

      }else{
        //not delete
      }
    });
  }

  changeTitle(title) {
    this.title = title;
  }
  async loadWorkFlows() {
    this.userApiService.getAllWorkOwnedFlows((response) => {
      if (response.status === 'success') {
        for (let i = 0; i < response.data.length; i++) {
          let tmpDoc: documentImage;
          tmpDoc = response.data[i];
          if(tmpDoc != null){
            this.documents.push(tmpDoc);
          }
        }
      } else {
        this.userApiService.displayPopOver('Error', 'unexpected error occured');
      }
    });
    this.userApiService.getAllWorkFlows((response) => {
      console.log("Got normal workflows");
      console.log(response);
      if (response.status === 'success') {
        for (let i = 0; i < response.data.length; i++) {
          let tmpDoc: documentImage;
          tmpDoc = response.data[i];
          if(tmpDoc != null){
            this.documents.push(tmpDoc);
          }
        }
      } else {
        this.userApiService.displayPopOver('Error', 'unexpected error occurred');
      }
    });
  }

  async editWorkflow(id_ : string){
    // const editModal = await this.modals.create({
    //   component: EditWorkflowComponent,
    //   componentProps:{
    //     workflowID: id_
    //   }
    // });

    // (await editModal).present();

    // (await editModal).onDidDismiss().then(async (data)=>{
    //   const documents = (await data).data['document'];
    //   // const file = (await data).data['file'];
    //   let phases = '';
    //   console.log(documents.phases);
    //   for(let i=0; i<documents.phases.length; ++i) //Sending arrays of arrays does not work well in angular so this workaround will have to do.
    //   {
    //     let temp = '[';
    //     for(const [key, value] of Object.entries(documents.phases[i]))
    //       temp+=value + ' ';
    //     phases += temp.substr(0, temp.length-1) +']'; //dont want the trailing space
    //   }
    //   console.log(phases);
    //   const workflowData = {
    //     name: documents.workflowName,
    //     description: documents.workflowDescription
    //   };
    // })
  }

  async addWorkflow() {
    console.log("here");
    this.router.navigate(['home/addWorkflow']);
  }

  viewWorkFlow(id: string, name: string) {
    // this.navControl.navigateForward
    this.router.navigate(['/home/documentView', {
      id,
      documentname: name,
      userEmail: this.user.email
    }]);
  }

  logout(){
    this.userApiService.logout();
    this.router.navigate(['login']);
  }

  toProfilepage(){
    this.router.navigate(['/home/userProfile']);
  }

  fixOrder(event: CustomEvent<ItemReorderEventDetail>){
    event.detail.complete();
  }

  hideMenu(){

  }
}
