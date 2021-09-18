import { TypeModifier } from '@angular/compiler/src/output/output_ast';
import {
  Component,
  ElementRef,
  OnInit,
  Sanitizer,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  AbstractControlOptions,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { IonicSafeString } from '@ionic/core';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  IonReorderGroup,
  IonSelect,
  ModalController,
  Platform,
} from '@ionic/angular';
import { ItemReorderEventDetail } from '@ionic/core';
import { DocumentActionAreaComponent } from 'src/app/components/document-action-area/document-action-area.component';
import { User, UserAPIService } from 'src/app/Services/User/user-api.service';
import * as Cookies from 'js-cookie';
import { WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';
import { AIService } from 'src/app/Services/AI/ai.service';
// import { VerifyEmail } from 'src/app/Services/Validators/verifyEmail.validator';
import WebViewer, {Core} from '@pdftron/webviewer';
import { VerifyEmail } from '../../Services/Validators/verifyEmail.validator';


@Component({
  selector: 'app-document-add',
  templateUrl: './document-add.page.html',
  styleUrls: ['./document-add.page.scss'],
})
export class DocumentAddPage implements OnInit {
  @ViewChildren('selectContact') selectContact: IonSelect;
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  workflowForm: FormGroup;
  userCount = 1;
  phases: FormArray;
  file: File;

  addFile: boolean;
  addName: boolean;
  addDescription: boolean;

  reOrder: boolean;

  srcFile: any;
  rotated: number;
  setZoom: any;
  zoomLevel: number;

  blob: Blob;

  next: boolean;
  user: User;
  ownerEmail: any;
  sizeMe: boolean;

  template: boolean = false;

  showPhase: boolean[] = [];
  filter: string;
  contacts: string[] =[];

  controller: boolean;
  @ViewChild('viewer') viewerRef: ElementRef;
  constructor(
    private plat: Platform,
    private fb: FormBuilder,
    private actionSheetController: ActionSheetController,
    private modal: ModalController,
    private router: Router,
    private userApiService: UserAPIService,
    private aiService: AIService,
    private sanitizer: DomSanitizer,
    private workflowService: WorkFlowService
  ) {}

  //  [verifierEmail.verifyEmail.bind(verifierEmail)]

  async ngOnInit() {
    if (Cookies.get('token') === undefined) {
      await this.router.navigate(['/login']);
      return;
    } else {
      this.userApiService.checkIfAuthorized().subscribe(
        (response) => {
          console.log('Successfully authorized user');
        },
        async (error) => {
          console.log(error);
          await this.router.navigate(['/login']);
          return;
        }
      );
    }
    if (this.plat.width() > 572) {
      this.sizeMe = false;
    } else {
      this.sizeMe = true;
    }

    // const formOptions: AbstractControlOptions = {
    //   validators: verifyEmail('user', this.userApiService),
    // };

    this.next = false;
    this.rotated = 0;
    this.setZoom = 'false';
    this.zoomLevel = 1;

    this.reOrder = true;

    this.addFile = false;
    this.addDescription = false;
    this.addName = false;
    this.controller = false;

    const verifierEmail = new VerifyEmail(this.userApiService);

    this.workflowForm = this.fb.group({
      workflowName: ['', [Validators.required]],
      workflowDescription: ['', [Validators.required]],
      workflowFile: ['', [Validators.required]],
      phases: this.fb.array([
        this.fb.group({
          annotations: new FormControl('', [Validators.required]),
          description: new FormControl('', Validators.required),
          users: this.fb.array([
            this.fb.group({
              user: new FormControl('', [
                Validators.email,
                Validators.required,
                Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
              ],[verifierEmail.verifyEmail.bind(verifierEmail)] ),
              permission: new FormControl('', [Validators.required]),
              accepted: new FormControl('false', [Validators.required]),
            }),
          ]),
        }),
      ]),
    });
    this.showPhase.push(true);
    await this.getUser();
    await this.getContacts();
  }

  async getUser() {
    await this.userApiService.getUserDetails(async (response) => {
      if (response) {
        this.user = response.data;
        this.ownerEmail = this.user.email;
        console.log(this.ownerEmail);
      } else {
        this.userApiService.displayPopOver('Error', 'Cannot find user');
      }
    });
  }

  checkStatus() {
    if (this.workflowForm.get('workflowName').valid) {
      this.addName = true;
    } else {
      this.addName = false;
    }
    if (this.workflowForm.get('workflowDescription').valid) {
      this.addDescription = true;
    } else {
      this.addDescription = false;
    }
  }

  changeController() {
    this.controller = !this.controller;
  }

  changeOver() {
    this.next = !this.next;
  }

  addUser(form: FormArray) {
    form.push(this.createNewUser());
  }

  createNewUser(): FormGroup {

    return this.fb.group({
      user: new FormControl('', [Validators.email, Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
      permission: new FormControl('', [Validators.required]),
      accepted: new FormControl('false', [Validators.required]),
    });
  }

  removeUser(control: FormArray, i: number, j: number) {
    if (control.length > 1) {
      control.removeAt(j);
    } else {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      if (this.workflowForm.controls.phases['controls'].length > 1) {
        this.removePhase(i);
      } else {
        this.userApiService.displayPopOver(
          'Error',
          'you need at least one user and phase'
        );
      }
    }
  }

  changePermission(control: any, str: string) {
    control.setValue(str);
  }


  createPhase(): FormGroup {
    const verifierEmail = new VerifyEmail(this.userApiService);

    // const verifierEmail = new VerifyEmail(this.userApiService);
    return this.fb.group({
      description: new FormControl('', Validators.required),
      annotations: new FormControl('', [Validators.required]),
      users: this.fb.array([
        this.fb.group({
          user: new FormControl('', [
            Validators.email,
            Validators.required,
            , Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
          ],  [verifierEmail.verifyEmail.bind(verifierEmail)]),
          permission: new FormControl('', [Validators.required]),
          accepted: new FormControl('false', [Validators.required]),
        } ),
      ]),
    });
  }

  addPhase() {
    const phase = this.workflowForm.get('phases') as FormArray;
    phase.push(this.createPhase());
    this.showPhase.push(true);
  }

  removePhase(i: number) {
    const phase = this.workflowForm.get('phases') as FormArray;
    if (phase.length > 1) {
      phase.removeAt(i);
      this.showPhase.splice(i,1);
    } else {
      this.userApiService.displayPopOver(
        'Error',
        'you need at least one user and phase'
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
    console.log(typeof this.file);
    console.log('file', await this.file.arrayBuffer());
    // const buff = response.data.filedata.Body.data; //wut

    this.srcFile = new Uint8Array(await this.file.arrayBuffer());

    this.workflowForm.get('workflowFile').setValue(this.file);
    this.blob = new Blob([this.file], { type: 'application/pdf;base64' });
    console.log(this.blob.arrayBuffer());
    const obj = URL.createObjectURL(this.blob);
    console.log(obj);
    this.srcFile = obj;
    this.addFile = true;

    this.displayWebViewer(this.blob);

    const addDocButton = document.getElementById('uploadFile');
    addDocButton.parentNode.removeChild(addDocButton);
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

      instance.Core.documentViewer.setSearchHighlightColors({
        // setSearchHighlightColors accepts both Annotations.Color objects or 'rgba' strings
        searchResult: new instance.Core.Annotations.Color(0, 0, 255, 0.5),
        activeSearchResult: 'rgba(0, 255, 0, 0.5)'
      });


      instance.Core.documentViewer.addEventListener('documentLoaded', async ()=>{
        const PDFNet = instance.Core.PDFNet;
        const doc = await PDFNet.PDFDoc.createFromBuffer(await this.file.arrayBuffer());

        const extractedText = await this.extractDocumentText(doc, PDFNet);

        const docType = this.aiService.categorizeDocument(extractedText);
        console.log('DOCUMENT OF TYPE: ', docType);
        const actionAreas = this.aiService.identifyActionAreas(extractedText, docType);
        await this.highlightActionAreas(instance, PDFNet, doc, actionAreas);
        doc.unlock();
      });
    });
  }

  fixOrder(ev: CustomEvent<ItemReorderEventDetail>) {
    const phase = this.workflowForm.get('phases') as FormArray;
    const a = phase.controls.splice(ev.detail.from, 1);
    phase.controls.splice(ev.detail.to, 0, a[0]);
    ev.detail.complete();
  }

  reOrderTime() {
    this.reOrder = !this.reOrder;
  }

  debug(str: any) {
    console.log(this.workflowForm);
  }

  async includeActionArea(i: number, form: FormControl) {
    console.log(i);
    const a = await this.modal.create({
      component: DocumentActionAreaComponent,
      componentProps: {
        file: this.blob,
        ownerEmail: this.ownerEmail,
        phaseNumber: i,
      },
    });

    await (await a).present();
    (await a).onDidDismiss().then(async (data) => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      const result = (await data).data['xfdfString'];
      if (result) {
        form.setValue(result);
      } else {
        //not delete
      }
    });
  }

  async submit() {
    await this.createWorkflow();
  }

  async createWorkflow() {
    console.log('Extracting form data ------------------------------');
    console.log('Name: ', this.workflowForm.controls.workflowName.value);
    console.log(
      'Description: ',
      this.workflowForm.controls.workflowDescription.value
    );
    console.log(this.workflowForm);
    let template = null;
    if(this.workflowForm.controls.templateName !== undefined){
      template = {templateName: this.workflowForm.controls.templateName.value, templateDescription: this.workflowForm.controls.templateDescription.value};
    }


    const phases = this.workflowForm.controls.phases.value;
    const name = this.workflowForm.controls.workflowName.value;
    const description = this.workflowForm.controls.workflowDescription.value;
    await this.workflowService.createWorkflow(
      name,
      description,
      phases,
      this.file,
      template,
      (response) => {
        if (response.status === 'success') {
          this.userApiService.displayPopOver('Success', 'You have successfully created a workflow');
          this.router.navigate(['/home']);
        } else {
          this.userApiService.displayPopOver('Error', 'Something has gone wrong, please try again');
        }
      }
    );
  }

  printForm() {
    console.log(this.workflowForm);
  }

  toggleVisibility(i: number){
    this.showPhase[i] = !this.showPhase[i];
  }

  addTemplate(){
    this.template = !this.template;
    if(this.template === false){
      this.removeTemplate();
    }else{
      this.workflowForm.addControl('templateName', new FormControl('', Validators.required));
      this.workflowForm.addControl('templateDescription', new FormControl('', Validators.required));
    }
  }

  removeTemplate(){
    this.workflowForm.removeControl('templateName');
    this.workflowForm.removeControl('templateDescription');
  }

   async getContacts(){
    await this.userApiService.getContacts((response)=>{
      if(response){
        if (response.status === 'success') {
          this.contacts = response.data.contacts;
        } else {
          this.userApiService.displayPopOver('Error', 'Failed to get users');
        }
      }
    });
  }

  async extractDocumentText(doc, PDFNet) {
    let extractedText = "";
    /*Testing if we can retrieve hash stored in a document*/
    const doc1 = await doc.getSDFDoc();
    doc1.initSecurityHandler();
    doc1.lock();

    /*    */
    const txt = await PDFNet.TextExtractor.create();
    ;
    const pageCount = await doc.getPageCount();
    for (let i = 1; i <= pageCount; ++i) {
      const page = await doc.getPage(i);
      const rect = await page.getCropBox();
      txt.begin(page, rect); // Read the page.
      extractedText += await txt.getAsText();
    }
    return extractedText;
  }

  async highlightActionAreas(instance, PDFNet, doc, actionAreas){
    for(const actionArea of actionAreas) {
      if(!actionArea[1]){
        continue;
      }
      let pattern = actionArea[0];
      /* Diffeerent text search approach */
      const txtSearch = await PDFNet.TextSearch.create();
      let mode = PDFNet.TextSearch.Mode.e_whole_word + PDFNet.TextSearch.Mode.e_page_stop + PDFNet.TextSearch.Mode.e_highlight;

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

          const textQuad = new instance.Core.Math.Quad(hltQuad.p1x, ph - hltQuad.p1y, hltQuad.p2x, ph - hltQuad.p2y, hltQuad.p3x, ph - hltQuad.p3y, hltQuad.p4x, ph - hltQuad.p4y);

          const highlight = new instance.Core.Annotations.TextHighlightAnnotation();
          //console.log(result.pageNum);
          highlight.PageNumber = result.page_num;
          highlight.StrokeColor = new instance.Core.Annotations.Color(255, 255, 0);
          highlight.Quads = [textQuad];

          await instance.Core.annotationManager.addAnnotation(highlight);
          await instance.Core.annotationManager.drawAnnotations({pageNumber: result.page_num});
        } else if (result.code === PDFNet.TextSearch.ResultCode.e_page) {
          // you can update your UI here, if needed
        } else if (result.code === PDFNet.TextSearch.ResultCode.e_done) {
          break;
        }
      }
    }
    }

    figureOut(i :number, j){
      let total =0;
      i++;
      j++;
      console.log(i +" "+ j)
      let b:number =0;
      for( b <= i; b++;){
        console.log(this.workflowForm.controls.phases['controls'][i].controls.users);
      }
    }

    async addFriend(i: number, j: number) {
      // console.log(j)
      this.figureOut(i,j);
      this.selectContact['_results'][j].open();
    }

    async friendChosen(form: FormControl, i: number, j: number) {
      // console.log(form);
      console.log(this.workflowForm.controls.phases['controls'][i].controls.users.controls[j].controls.user );
      this.workflowForm.controls.phases['controls'][i].controls.users.controls[j].controls.user.setValue(this.selectContact['_results'][j].value);
    }
}
