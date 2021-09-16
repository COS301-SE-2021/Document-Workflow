import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, Platform } from '@ionic/angular';
import { UserAPIService } from 'src/app/Services/User/user-api.service';
import { WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';
import * as Cookies from 'js-cookie';
import WebViewer, { Core } from '@pdftron/webviewer';
import { PDFDocument } from 'pdf-lib';
@Component({
  selector: 'app-document-verify',
  templateUrl: './document-verify.page.html',
  styleUrls: ['./document-verify.page.scss'],
})
export class DocumentVerifyPage implements OnInit {
  @Input('workflowID') docName: string;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  @ViewChild('viewer') viewerRef: ElementRef;

  sizeMe: boolean;
  file: File;
  constructor(
    private route: ActivatedRoute,
    private workflowService: WorkFlowService,
    private router: Router,
    private userApiService: UserAPIService,
    private plat: Platform,
    private actionSheetController: ActionSheetController,
  ) {}

  async ngOnInit() {
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
    this.verifyDocument();
 
  }

  verifyDocument(){
    const blob = new Blob([this.file], { type: 'application/pdf;base64' });
    console.log(blob);
    this.displayWebViewer(blob);
  }

  async extractHash(doc: Core.PDFNet.PDFDoc){
    const doc1 = await doc.getSDFDoc();
    doc1.initSecurityHandler();
    doc1.lock();
    const trailer = await doc1.getTrailer(); // Get the trailer

    const metadata = await doc.getDocInfo();
    return metadata.getKeywords();
  }

  displayWebViewer(blob: Blob){

    WebViewer({
      path: './../../../assets/lib',
      fullAPI:true
    }, this.viewerRef.nativeElement).then(async instance =>{

      instance.Core.PDFNet.initialize();

      instance.UI.loadDocument(blob, {filename: 'Preview Document'});
      instance.UI.disableElements(['ribbons']);
      instance.UI.setToolbarGroup('toolbarGroup-View',false);
    
      instance.Core.documentViewer.addEventListener('documentLoaded', async ()=>{
        const PDFNet = instance.Core.PDFNet;
        const doc = await PDFNet.PDFDoc.createFromBuffer(await this.file.arrayBuffer());
        const hash= await this.extractHash(doc);
        console.log(hash);
        this.verifyHash(hash);
        
      });
    });
  }

  verifyHash(hash){

  }
}
