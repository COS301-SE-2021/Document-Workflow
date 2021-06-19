import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirm-delete-workflow',
  templateUrl: './confirm-delete-workflow.component.html',
  styleUrls: ['./confirm-delete-workflow.component.scss'],
})
export class ConfirmDeleteWorkflowComponent implements OnInit {

  constructor(private modal: ModalController) { }

  ngOnInit() {}

  confirm(){
    this.modal.dismiss({
      confirm: true
    });
  }

  reject(){
    this.modal.dismiss({
      confirm: false
    });
  }
}
