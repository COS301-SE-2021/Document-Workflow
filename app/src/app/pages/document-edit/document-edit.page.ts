/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/dot-notation */
import {Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild} from '@angular/core';

import { ModalController, NavParams, Platform, PopoverController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentAPIService } from 'src/app/Services/Document/document-api.service';
import {WorkFlowService} from 'src/app/Services/Workflow/work-flow.service';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import WebViewer from '@pdftron/webviewer';
import { UserAPIService } from 'src/app/Services/User/user-api.service';
import { UserNotificationsComponent } from 'src/app/components/user-notifications/user-notifications.component';


@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.page.html',
  styleUrls: ['./document-edit.page.scss'],
})
export class DocumentEditPage implements OnInit, AfterViewInit {
  srcFile: any;
  srcFileBase64: any;
  pdfDoc: PDFDocument;
  showAnnotations = true;
  annotationManager: any;
  annotationsString: string;
  documentViewer: any;
  PDFNet: any;
  documentMetadata: any;
  //This array is used to determine what annotations are and are not a part of action areas.
  //It is here in case the stakeholders of this project decide they want more action areas as part of the application
  annotationSubjects = ['Note' ]; //, 'Rectangle', 'Squiggly', 'Underline', 'Highlight', 'Strikeout'];

  @Input('documentname') docName: string;
  @Input('workflowId') workflowId: string;
  @ViewChild('viewer') viewerRef: ElementRef;
  @Input('userEmail') userEmail: string;
  constructor(
    private navpar: NavParams,
    private route: ActivatedRoute,
    private docApi: DocumentAPIService,
    private workflowService: WorkFlowService,
    private router: Router,
    private userApiService: UserAPIService,
    private pop: PopoverController,
  ) {}

  async ngOnInit() {
    await this.route.params.subscribe((data) => {
      this.workflowId = data['workflowId'];
      //this.docName = data['documentname'];
      this.userEmail = data['userEmail'];
    });
  }

  toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  async ngAfterViewInit(): Promise<void>{
    await this.workflowService.retrieveDocument(this.workflowId, async (response) => {
      console.log(response);
      if (response) {
        this.documentMetadata = response.data.metadata;
        this.docName = this.documentMetadata.name;
        this.srcFileBase64 = response.data.filedata.Body.data;
        const arr = new Uint8Array(response.data.filedata.Body.data);
        const blob = new Blob([arr], {type: 'application/pdf'});

        this.pdfDoc = await PDFDocument.load(arr);
        const pdfBytes = await this.pdfDoc.save();
        this.srcFile = pdfBytes;
        WebViewer({
          path: './../../../assets/lib',
          annotationUser: this.userEmail
        }, this.viewerRef.nativeElement).then(instance =>{

          this.annotationManager = instance.Core.annotationManager;
          this.PDFNet = instance.Core.PDFNet;
          this.documentViewer = instance.Core.documentViewer;

          instance.UI.loadDocument(blob, {filename: this.docName});
          instance.UI.disableElements(['toolbarGroup-Annotate']);
          instance.UI.setToolbarGroup('toolbarGroup-Insert', false);
          instance.UI.setHeaderItems(header =>{
            header.push({
              type: 'actionButton',
              // eslint-disable-next-line max-len
              img: '<svg xmlns=\'http://www.w3.org/2000/svg\' class=\'ionicon\' viewBox=\'0 0 512 512\'><title>Eye</title><path d=\'M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z\' fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'32\'/><circle cx=\'256\' cy=\'256\' r=\'80\' fill=\'none\' stroke=\'currentColor\' stroke-miterlimit=\'10\' stroke-width=\'32\'/></svg>',
              onClick: () =>  { this.toggleAnnotations(instance.Core.annotationManager) ;
             }
            });

            header.push({
              type: 'actionButton',
              // eslint-disable-next-line max-len
              img: '<svg xmlns:dc=http://purl.org/dc/elements/1.1/ xmlns:cc=http://creativecommons.org/ns# xmlns:rdf=http://www.w3.org/1999/02/22-rdf-syntax-ns# xmlns:svg=http://www.w3.org/2000/svg xmlns=http://www.w3.org/2000/svg xmlns:sodipodi=http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd xmlns:inkscape=http://www.inkscape.org/namespaces/inkscape width=37mm height=26mm viewBox="0 0 131.10236 92.125983" id=svg6085 version=1.1 inkscape:version="0.91 r13725" sodipodi:docname=download.svg><defs id=defs6087 /><sodipodi:namedview id=base pagecolor=#ffffff bordercolor=#666666 borderopacity=1.0 inkscape:pageopacity=0.0 inkscape:pageshadow=2 inkscape:zoom=1.4 inkscape:cx=-178.97587 inkscape:cy=-102.28552 inkscape:document-units=px inkscape:current-layer=layer1 showgrid=false inkscape:window-width=1920 inkscape:window-height=1017 inkscape:window-x=-8 inkscape:window-y=-8 inkscape:window-maximized=1 showguides=true inkscape:guide-bbox=true /><metadata id=metadata6090><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource=http://purl.org/dc/dcmitype/StillImage /><dc:title></dc:title></cc:Work></rdf:RDF></metadata><g inkscape:label="Laag 1" inkscape:groupmode=layer id=layer1 transform=translate(0,-960.23623)><path style=opacity:1;fill:#6c5353;fill-opacity:.94509804;fill-rule:nonzero;stroke:none;stroke-width:1.58158517;stroke-miterlimit:4;stroke-dasharray:1.58158517,3.16317034;stroke-dashoffset:0;stroke-opacity:1 d="" id=path6839 inkscape:connector-curvature=0 transform=translate(0,960.23623) /><g transform=matrix(1.9405193,0,0,1.6402328,37.343102,982.06253) id=g3 style=fill:#6c5353;fill-opacity:.94509804 inkscape:transform-center-x=-305.06607 inkscape:transform-center-y=48.487322><path inkscape:connector-curvature=0 d="m 25.462,19.105 0,6.848 -20.947,0 0,-6.848 -4.026,0 0,8.861 c 0,1.111 0.9,2.012 2.016,2.012 l 24.967,0 c 1.115,0 2.016,-0.9 2.016,-2.012 l 0,-8.861 -4.026,0 z" id=path5 style=fill:#6c5353;fill-opacity:.94509804 /><path inkscape:connector-curvature=0 d="M 14.62,18.426 8.856,11.461 c 0,0 -0.877,-0.828 0.074,-0.828 0.951,0 3.248,0 3.248,0 0,0 0,-0.557 0,-1.416 0,-2.449 0,-6.906 0,-8.723 0,0 -0.129,-0.494 0.615,-0.494 0.75,0 4.035,0 4.572,0 0.536,0 0.524,0.416 0.524,0.416 0,1.762 0,6.373 0,8.742 0,0.768 0,1.266 0,1.266 0,0 1.842,0 2.998,0 1.154,0 0.285,0.867 0.285,0.867 0,0 -4.904,6.51 -5.588,7.193 -0.492,0.495 -0.964,-0.058 -0.964,-0.058 z" id=path7 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g9 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g11 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g13 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g15 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g17 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g19 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g21 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g23 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g25 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g27 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g29 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g31 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g33 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g35 style=fill:#6c5353;fill-opacity:.94509804 /><g id=g37 style=fill:#6c5353;fill-opacity:.94509804 /></g></g></svg>',
              onClick: () =>  { this.downloadFile() ;}
              });
          });
          instance.Core.documentViewer.addEventListener('documentLoaded', ()=>{
            this.annotationsString = response.data.annotationsString;
            instance.Core.annotationManager.importAnnotations(response.data.annotations);
          });

          instance.UI.setHeaderItems(header =>{
            header.push({
              type: 'actionButton',
              img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
              onClick: async () => {
                await this.acceptDocument();
              }
            });
          });

        });
      }else {


      }
    });

  }

  download() {
    const blob = new Blob([this.srcFile], { type: 'application/pdf' });
    const objUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objUrl;
    link.download = this.docName;
    document.body.appendChild(link);

    link.click();
    link.remove();
  }



  toggleAnnotations(annotationManager){
   console.log("TToggling annotations");
    this.showAnnotations = !this.showAnnotations;
    const annotations = annotationManager.getAnnotationsList();
    if(this.showAnnotations){
      //annotManager.showAnnotations(annotations); //use if you wihs to hide the associated comments that go with an annotation as well as the annotation.
      annotations.forEach(annot =>{
        this.annotationSubjects.forEach(a =>{
          if(a === annot.Subject)
            annot.Hidden = false;
        });

      });
    }
    else{
      //annotManager.hideAnnotations(annotations);
      annotations.forEach(annot =>{
        this.annotationSubjects.forEach(a =>{
          if(a === annot.Subject)
            annot.Hidden = true;
        });

      });
    }
    annotationManager.drawAnnotationsFromList(annotations);
  }

  async getDocument(id: string) {
    await this.docApi.getDocument(id, async (response) => {
      if (response) {
        const buff = response.data.filedata.Body.data;
        this.srcFileBase64 = response.data.filedata.Body.data;
        const a = new Uint8Array(buff);

        this.pdfDoc = await PDFDocument.load(a);
        const pdfBytes = await this.pdfDoc.save();
        this.srcFile = pdfBytes;
      } else {
      }
    });
  }

  async back() {
    await this.userApiService.displayPopOverWithButtons('Go back','Are you sure you want to go back? Any unsaved changes will be lost.', (response) =>{
      if(response.data.confirm === true)
        this.router.navigate(['home']);
    });
  }

  async acceptDocument(){
    await this.userApiService.displayPopOverWithButtons('signPhase','Do you accept the phase as completed?', async (response) =>{

      this.removeActionAreasFromAnnotations();
      const xfdfString = await this.annotationManager.exportAnnotations();
      const options = {xfdfString: xfdfString, flatten: true};
      const data = await this.documentViewer.getDocument().getFileData(options);

      const arr = new Uint8Array(data);
      const blob = new Blob([arr], { type: 'application/pdf' });
      const file = new File([blob], this.documentMetadata.name);
      console.log(response.data.confirm);
      console.log(this.documentMetadata.name);
      console.log(file.name);
      await this.workflowService.updatePhase(this.workflowId, response.data.confirm, file, (response2) => {
        console.log(response2);
      });
      await this.annotationManager.importAnnotations(this.annotationsString);
    });
   }

   removeActionAreasFromAnnotations(){

    const toDelete = [];
    this.annotationManager.getAnnotationsList().forEach(annot =>{
      this.annotationSubjects.forEach(a =>{
        if(a === annot.Subject) {
          toDelete.push(annot);
        }
      });
    });
    this.annotationManager.deleteAnnotations(toDelete);
   }

  async updateDocumentAnnotations(annotationsString){
    await this.workflowService.updateCurrentPhaseAnnotations(this.workflowId, annotationsString, (response)=>{
      console.log(response);
    });
  }

private
downloadFile()
{

}
}
