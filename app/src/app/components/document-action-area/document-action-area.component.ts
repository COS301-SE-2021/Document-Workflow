import {Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild} from '@angular/core';

import { ModalController, NavParams, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentAPIService } from 'src/app/Services/Document/document-api.service';
import {WorkFlowService} from 'src/app/Services/Workflow/work-flow.service';
import {PDFDocument} from 'pdf-lib';
import WebViewer from '@pdftron/webviewer';


@Component({
  selector: 'app-document-action-area',
  templateUrl: './document-action-area.component.html',
  styleUrls: ['./document-action-area.component.scss'],
})
export class DocumentActionAreaComponent implements OnInit, AfterViewInit {

  pdfDoc: PDFDocument;
  showAnnotations = true;

  @ViewChild('viewer') viewerRef: ElementRef;

  @Input('file') file: any;
  @Input('phaseNumber') phaseNumber: any;
  @Input('ownerEmail') ownerEmail: any;
  constructor(
    private modalCtrl: ModalController,
    private navpar: NavParams,
    private route: ActivatedRoute,
    private docApi: DocumentAPIService,
    private workFlowService: WorkFlowService,
    private router: Router,
  ) {}

  async ngOnInit() {
    console.log(this.ownerEmail);
  }

  async ngAfterViewInit(): Promise<void>{

     //const arr = new Uint8Array();
     //this.pdfDoc = await PDFDocument.load(arr);
     //const pdfBytes = await this.pdfDoc.save();
    // const blob = new Blob([arr], { type: 'application/pdf' });

      WebViewer({
        path: '../../assets/lib',
        annotationUser: this.ownerEmail
      }, this.viewerRef.nativeElement)
        .then(instance => {
          //Look at the Callout tool of the insert bar as well as the stickers that can be inserted.

          instance.loadDocument(this.file, {});//,{filename: this.docName});

          const { docViewer, annotManager, CoreControls} = instance;
          instance.disableElements(['toolbarGroup-Shapes']);
          instance.disableElements(['toolbarGroup-Edit']);
          instance.disableElements(['toolbarGroup-Insert']);

          // Add header button that will get file data on click
          instance.setHeaderItems(header => {
            header.getHeader('toolbarGroup-Annotate').delete('highlightToolGroupButton');
            header.getHeader('toolbarGroup-Annotate').delete('underlineToolGroupButton');
            header.getHeader('toolbarGroup-Annotate').delete('strikeoutToolGroupButton');
            header.getHeader('toolbarGroup-Annotate').delete('squigglyToolGroupButton');
            header.getHeader('toolbarGroup-Annotate').delete('freeTextToolGroupButton');
            header.getHeader('toolbarGroup-Annotate').delete('freeHandToolGroupButton');

            header.push({
              type: 'actionButton',
              img: '<svg xmlns=\'http://www.w3.org/2000/svg\' class=\'ionicon\' viewBox=\'0 0 512 512\'><title>Eye</title><path d=\'M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z\' fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'32\'/><circle cx=\'256\' cy=\'256\' r=\'80\' fill=\'none\' stroke=\'currentColor\' stroke-miterlimit=\'10\' stroke-width=\'32\'/></svg>',
              onClick: () =>  { this.toggleAnnotations(annotManager);
              }
            });

            header.push({
              type: 'actionButton',
              img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
              onClick: async () => {
                const xfdfString = await annotManager.exportAnnotations();
                console.log(xfdfString);
              }
            });
          });

          docViewer.on('documentLoaded', () => {
          });
        });
  }

  toggleAnnotations(annotManager){

    this.showAnnotations = !this.showAnnotations;
    const annotations = annotManager.getAnnotationsList();
    if(this.showAnnotations){
      console.log("Showing annotations");
      //annotManager.showAnnotations(annotations);
      annotations.forEach(annot =>{
        annot.Hidden = false;
      });
    }
    else{
      console.log("Hiding annotations");
      //annotManager.hideAnnotations(annotations);
      annotations.forEach(annot =>{
        annot.Hidden = true;
      });
    }
    annotManager.drawAnnotationsFromList(annotations);

  }

  back() {
    alert("Implement me");
  }

}
