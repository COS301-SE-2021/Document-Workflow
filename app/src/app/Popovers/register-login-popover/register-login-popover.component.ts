import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-register-login-popover',
  templateUrl: './register-login-popover.component.html',
  styleUrls: ['./register-login-popover.component.scss'],
})
export class RegisterLoginPopoverComponent implements OnInit {

  @Input("Message") message;
  constructor() { }

  ngOnInit() {
    console.log(this.message);
  }

}
