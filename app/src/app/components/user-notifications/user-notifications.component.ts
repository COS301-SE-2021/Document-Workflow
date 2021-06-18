import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-notifications',
  templateUrl: './user-notifications.component.html',
  styleUrls: ['./user-notifications.component.scss'],
})
export class UserNotificationsComponent implements OnInit {

  @Input() message: string
  constructor() { }

  ngOnInit() {}

}
