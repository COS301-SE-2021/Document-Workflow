import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-user-notifications',
  templateUrl: './user-notifications.component.html',
  styleUrls: ['./user-notifications.component.scss'],
})
export class UserNotificationsComponent implements OnInit {
  @Input() message: string;
  @Input() title: string;

  accept: boolean;
  termOfService: boolean = false;
  constructor(private modal: ModalController) {}

  ngOnInit() {
    if (this.title === 'termsOfService') {
      this.termOfService = true;
      this.message =
        'Note that by making use of the Document Workflow system, you are ' +
        'essentially giving your soul to our Lizard overlord JeffBezos. He will steal all of' +
        'your personal data and rule over you like the absolute madlad he is. When the' +
        " robot uprising begins, you must understand that you are complicit in Jeff Bezos' " +
        'rise to power through your indirect support of him by using our services.' +
        'All hail King Zuck.';
    }
  }

  confirm() {
    this.modal.dismiss({
      confirm: true,
    });
  }

  reject() {
    this.modal.dismiss({
      confirm: false,
    });
  }
}
