import {Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild} from '@angular/core';

import { ModalController, NavParams, Platform } from '@ionic/angular';
import {PDFDocument} from 'pdf-lib';
import WebViewer from '@pdftron/webviewer';
import {DOCUMENT_TYPES} from "../../Services/AI/ai.service";

@Component({
  selector: 'app-document-action-area',
  templateUrl: './document-action-area.component.html',
  styleUrls: ['./document-action-area.component.scss'],
})
export class DocumentActionAreaComponent implements OnInit, AfterViewInit {

  pdfDoc: PDFDocument;
  showAnnotations = true;
  docName: string;
  xfdfString: any;
  annotationManager: any;

  @ViewChild('viewer') viewerRef: ElementRef;
  @Input('file') file: any;
  @Input('phaseNumber') phaseNumber: any;
  @Input('ownerEmail') ownerEmail: any;
  @Input('actionAreas') actionAreas: any;
  constructor(
    private modal: ModalController,
  ) {}

  async ngOnInit() {
  }

  async ngAfterViewInit(): Promise<void>{

    WebViewer({
      path: '../../../assets/lib',
      //path: '../../../../node_modules/@pdftron/webviewer/public',
      annotationUser: this.ownerEmail,
      fullAPI: true
    }, this.viewerRef.nativeElement)
      .then(instance => {
        instance.Core.PDFNet.initialize();
        const {documentViewer, annotationManager} = instance.Core;
        this.annotationManager = annotationManager;
        instance.UI.loadDocument(this.file, {}); //this.file is a blob.
        //We only want to display the Annotations ribbon
        instance.UI.disableElements(['ribbons']);
        instance.UI.setToolbarGroup('toolbarGroup-Annotate',false);

        //adds the button used to toggle visibility of annotations
        instance.UI.setHeaderItems(header =>{
          header.push({
            type: 'actionButton',
            img: '<svg xmlns=\'http://www.w3.org/2000/svg\' class=\'ionicon\' viewBox=\'0 0 512 512\'><title>Eye</title><path d=\'M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z\' fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'32\'/><circle cx=\'256\' cy=\'256\' r=\'80\' fill=\'none\' stroke=\'currentColor\' stroke-miterlimit=\'10\' stroke-width=\'32\'/></svg>',
            onClick: () =>  { this.toggleAnnotations(annotationManager);
            }
          });
          //Disable annotation tools that will not be supported.
          header.getHeader('toolbarGroup-Annotate').delete('freeTextToolGroupButton');
          header.getHeader('toolbarGroup-Annotate').delete('freeHandToolGroupButton');
          header.getHeader('toolbarGroup-Annotate').delete('freeHandHighlightToolGroupButton');
          header.getHeader('toolbarGroup-Annotate').delete('highlightToolGroupButton');
          header.getHeader('toolbarGroup-Annotate').delete('underlineToolGroupButton');
          header.getHeader('toolbarGroup-Annotate').delete('strikeoutToolGroupButton');
          header.getHeader('toolbarGroup-Annotate').delete('squigglyToolGroupButton');
          header.getHeader('toolbarGroup-Annotate').delete('shapeToolGroupButton');
        });
        instance.UI.setCustomNoteFilter(annot => !(annot instanceof instance.Core.Annotations.TextHighlightAnnotation));
        instance.Core.documentViewer.addEventListener(
          'documentLoaded',
          async () => {
              const PDFNet = instance.Core.PDFNet;
              const doc = await PDFNet.PDFDoc.createFromBuffer(await this.file.arrayBuffer());


              await this.highlightActionAreas(
                instance,
                PDFNet,
                doc,
                this.actionAreas
              );
              doc.unlock();
            }
            );

      });
  }

  toggleAnnotations(annotationManager){

    this.showAnnotations = !this.showAnnotations;
    const annotations = annotationManager.getAnnotationsList();

    annotations.forEach(annotation =>{
      console.log(annotation);
    });

    if(this.showAnnotations){
      //annotManager.showAnnotations(annotations); //use if you wihs to hide the associated comments that go with an annotation as well as the annotation.
      annotations.forEach(annot =>{
        annot.Hidden = false;
      });
    }
    else{
      //annotManager.hideAnnotations(annotations);
      annotations.forEach(annot =>{
        annot.Hidden = true;
      });
    }
    annotationManager.drawAnnotationsFromList(annotations);
  }

  async highlightActionAreas(instance, PDFNet, doc, actionAreas) {
    for (const actionArea of actionAreas) {
      if (!actionArea[1]) {
        continue;
      }
      let pattern = actionArea[0];
      /* Diffeerent text search approach */
      const txtSearch = await PDFNet.TextSearch.create();
      let mode =
        PDFNet.TextSearch.Mode.e_whole_word +
        PDFNet.TextSearch.Mode.e_page_stop +
        PDFNet.TextSearch.Mode.e_highlight;

      txtSearch.begin(doc, pattern, mode);

      while (true) {
        let result = await txtSearch.run();
        if (result.code === PDFNet.TextSearch.ResultCode.e_found) {
          let hlts = result.highlights;
          await hlts.begin(doc);

          const quadArr = await hlts.getCurrentQuads();
          const hltQuad = quadArr[0];
          const page = await doc.getPage(await hlts.getCurrentPageNumber());
          const ph = await page.getPageHeight();

          const textQuad = new instance.Core.Math.Quad(
            hltQuad.p1x,
            ph - hltQuad.p1y,
            hltQuad.p2x,
            ph - hltQuad.p2y,
            hltQuad.p3x,
            ph - hltQuad.p3y,
            hltQuad.p4x,
            ph - hltQuad.p4y
          );

          const highlight =
            new instance.Core.Annotations.TextHighlightAnnotation();
          //console.log(result.pageNum);
          highlight.PageNumber = result.page_num;
          highlight.StrokeColor = new instance.Core.Annotations.Color(
            255,
            255,
            0
          );
          highlight.Quads = [textQuad];

          await instance.Core.annotationManager.addAnnotation(highlight);
          await instance.Core.annotationManager.drawAnnotations({
            pageNumber: result.page_num,
          });
        } else if (result.code === PDFNet.TextSearch.ResultCode.e_page) {
          // you can update your UI here, if needed
        } else if (result.code === PDFNet.TextSearch.ResultCode.e_done) {
          break;
        }
      }
    }
  }


  async back() {

    const toDelete = [];
    this.annotationManager.getAnnotationsList().forEach(annot =>{
      if('Highlight' === annot.Subject) {
          toDelete.push(annot);
      }
    });
    this.annotationManager.deleteAnnotations(toDelete);
    this.xfdfString = await this.annotationManager.exportAnnotations({links: false, widgets: false});
    console.log(this.xfdfString);
    await this.modal.dismiss({
      xfdfString: this.xfdfString
    });
  }
}
