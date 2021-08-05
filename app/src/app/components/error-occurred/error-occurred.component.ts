import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-user-notifications',
  templateUrl: './error-occurred.component.html',
  styleUrls: ['./error-occurred.component.scss'],
})
export class ErrorOccurredComponent implements OnInit {
  @Input() message: string;
  @Input() title: string;

  constructor(private modal: ModalController) {}

  ngOnInit() {
    console.log("Message is: ");
    if(this.message === undefined || this.title === undefined) { //Default message
      this.title = 'Oops';
      this.message = 'An error occurred. Please try again later';
    }
  }

  okay(){
    this.modal.dismiss({
    });
  }
}
