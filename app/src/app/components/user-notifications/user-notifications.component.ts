import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-user-notifications',
  templateUrl: './user-notifications.component.html',
  styleUrls: ['./user-notifications.component.scss'],
})
export class UserNotificationsComponent implements OnInit {
  @Input() message: string;
  @Input() title: string;
  @Input() displayButton: boolean

  accept: boolean;
  constructor(private pop: PopoverController) {}

  //TODO: take in an extra variable boolean that determines whether or not this popup should display buttons.
  //Link this to the user services such that you can call one function for no buttons, and another for buttons
  ngOnInit() {
    if (this.title === 'termsOfService') {
      this.message =
        'Note that by making use of the Document Workflow system, you are ' +
        'essentially giving your soul to our Lizard overlord JeffBezos. He will steal all of' +
        'your personal data and rule over you like the absolute madlad he is. When the' +
        'robot uprising begins, you must understand that you are complicit in Jeff Bezos'  +
        'rise to power through your indirect support of him by using our services.' +
        'All hail King Zuck.';
    }
  }

  confirm() {
    this.pop.dismiss({
      'confirm': true,
    });
  }

  reject() {
    this.pop.dismiss({
      'confirm': false,
    });
  }
}
