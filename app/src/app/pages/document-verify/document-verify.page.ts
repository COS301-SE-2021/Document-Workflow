import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, Platform } from '@ionic/angular';
import { UserAPIService } from 'src/app/Services/User/user-api.service';
import { WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';
import * as Cookies from 'js-cookie';
import WebViewer, { Core } from '@pdftron/webviewer';
import { PDFDocument } from 'pdf-lib';

export interface history{
  currentPhase: number;
  hash: string;
  type: string;
  userEmail: string;
  date: Date;
}
@Component({
  selector: 'app-document-verify',
  templateUrl: './document-verify.page.html',
  styleUrls: ['./document-verify.page.scss'],
})
export class DocumentVerifyPage implements OnInit {
  @Input('workflowID') docName: string;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  @ViewChild('viewer') viewerRef: ElementRef;


  docHistory: history[] =[];
  sizeMe: boolean;
  file: File;
  workflowId: string;
  ready: boolean;
  readyDoc: boolean;

  constructor(
    private route: ActivatedRoute,
    private workflowService: WorkFlowService,
    private router: Router,
    private userApiService: UserAPIService,
    private plat: Platform,
    private actionSheetController: ActionSheetController,
  ) {}

  async ngOnInit() {
    this.ready = false;
    this.readyDoc = false;
    if (this.plat.width() > 572) {
      this.sizeMe = false;
    } else {
      this.sizeMe = true;
    }

    if (Cookies.get('token') === undefined) {
      await this.router.navigate(['/login']);
      this.workflowService.dismissLoading();
      return;
    } else {
      this.userApiService.checkIfAuthorized().subscribe(
        (response) => {
          console.log('Successfully authorized user');
        },
        async (error) => {
          console.log(error);
          await this.router.navigate(['/login']);
          this.workflowService.dismissLoading();
          return;
        }
      );
    }
    await this.route.params.subscribe((data) => {
      this.workflowId = data['workflowId'];
    });


  }

  async selectImageSource() {
    const buttons = [
      {
        text: 'Choose a file',
        icon: 'attach',
        handler: () => {
          this.fileInput.nativeElement.click();
        },
      },
    ];

    if (this.plat.is('desktop')) {
      this.fileInput.nativeElement.click();
    } else {
      const actionSheet = await this.actionSheetController.create({
        header: 'Select PDF',
        buttons,
      });

      await actionSheet.present();
    }
  }

  async uploadFile(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    this.file = target.files[0];
    document.getElementById('uploadFile').style.display = 'none';
    this.verifyDocument();

  }

  verifyDocument(){
    const blob = new Blob([this.file], { type: 'application/pdf;base64' });
    this.displayWebViewer(blob);
  }

  async extractHash(doc: Core.PDFNet.PDFDoc){
    const doc1 = await doc.getSDFDoc();
    doc1.initSecurityHandler();
    doc1.lock();
    const trailer = await doc1.getTrailer(); // Get the trailer

    const metadata = await doc.getDocInfo();
    const keywords = await metadata.getKeywords();
    return keywords;
  }

  displayWebViewer(blob: Blob){

    WebViewer({
      path: './../../../assets/lib',
      fullAPI:true,
      isReadOnly: true
    }, this.viewerRef.nativeElement).then(async instance =>{

      instance.Core.PDFNet.initialize();

      instance.UI.loadDocument(blob, {filename: 'Preview Document'});
      instance.UI.disableElements(['ribbons']);
      instance.UI.setToolbarGroup('toolbarGroup-View',false);

      instance.Core.documentViewer.addEventListener('documentLoaded', async ()=>{
        const PDFNet = instance.Core.PDFNet;
        const doc = await PDFNet.PDFDoc.createFromBuffer(await this.file.arrayBuffer());
        const hash= await this.extractHash(doc);
        await this.verifyHash(hash);
      });
    });
  }

  async verifyHash(hash){
    console.log('hash: ' + hash);
    if(hash.length == 0){
      this.userApiService.displayPopOver('Error','This document has no associated stored hash' +
        ', thus it does not originate from Document Workflow');
      return;
    }
    await this.workflowService.verifyDocument(hash, this.workflowId, async (response) =>{
      if(response.status === 'success'){

        let tmp:history =JSON.parse(response.data.entry);
        tmp.date = new Date(tmp.date);
        tmp.type = this.textConverter(tmp.type);
        await this.workflowService.displayPopOver('Success', 'This document corresponds to a workflow with details: '
          + '\n Date: ' + tmp.date + ' Phase: ' + tmp.currentPhase + '\n'+
          'Hash: ' + tmp.hash + ' \n ' + tmp.userEmail + ' ' + tmp.type);
        this.docHistory.push(tmp);

      }
      else{
        await this.workflowService.displayPopOver('Error', 'This document does not originate from this workflow or has had its associated hash modified');
      }
    });
  }

  textConverter(str: string): string {
    let tmp: string;
    switch (str) {
      case 'Create':
        tmp = 'created the workflow';
        break;
      case 'Sign':
        tmp = 'signed the workflow';
        break;
      case 'View':
        tmp = 'viewed';
        break;
      case 'Accept':
        tmp = 'accepted the phase';
        break;
      case 'Revert':
        tmp = 'reverted the changes made';
        break;
    }
    return tmp;
  }
}
