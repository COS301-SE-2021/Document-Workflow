import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-user-notifications',
  templateUrl: './error-occurred.component.html',
  styleUrls: ['./error-occurred.component.scss'],
})
export class ErrorOccurredComponent implements OnInit {
  message: string;
  title: string;

  constructor(private modal: ModalController) {}

  ngOnInit() {
    this.title = 'Oops';
    this.message = 'An error occurred and we were not able to load in the data you requested. Please try again later';
  }

  okay(){
    this.modal.dismiss({
    });
  }
}
