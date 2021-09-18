import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirm-signatures',
  templateUrl: './confirm-signatures.component.html',
  styleUrls: ['./confirm-signatures.component.scss'],
})
export class ConfirmSignaturesComponent implements OnInit {

  constructor(
    private modal: ModalController
  ) { }

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
