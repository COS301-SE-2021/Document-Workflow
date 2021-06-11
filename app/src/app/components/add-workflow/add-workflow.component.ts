import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { DocumentViewPageRoutingModule } from 'src/app/pages/document-view/document-view-routing.module';

@Component({
  selector: 'app-add-workflow',
  templateUrl: './add-workflow.component.html',
  styleUrls: ['./add-workflow.component.scss'],
})
export class AddWorkflowComponent implements OnInit {

  workflowForm: FormGroup;
  private userCount=1;

  constructor(
    private plat: Platform,
    private fb: FormBuilder
    ) { }

  ngOnInit() {
    this.workflowForm = this.fb.group({
      workflowName: ['',[Validators.required]],
      workflowDescription:['', [Validators.required]],
      user1: ['', [Validators.required]],
      file: ['', [Validators.required]]
    });
  }

  adduser(){
    this.userCount = this.userCount +1;
    this.workflowForm.addControl('user'+ this.userCount, new FormControl('',[Validators.required]));
  }

  uploadFile(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    const file: File = target.files[0];

    console.log('file', file);
  }

  submit(){

  }


}
