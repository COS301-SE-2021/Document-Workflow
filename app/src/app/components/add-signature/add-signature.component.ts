import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-signature',
  templateUrl: './add-signature.component.html',
  styleUrls: ['./add-signature.component.scss'],
})
export class AddSignatureComponent implements OnInit {

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
