/* eslint-disable @typescript-eslint/naming-convention */
import {
  Component,
  Input,
  OnInit,
  ɵɵsanitizeUrlOrResourceUrl,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AbstractControlOptions, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User, UserAPIService } from '../../Services/User/user-api.service';
import { match } from './../../Services/match.validator';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit {
  user: User;
  userForm: FormGroup;
  srcFile: any;
  ready: boolean;
  sizeMe: boolean;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserAPIService,
    private sanitizer: DomSanitizer,
    private plat: Platform
  ) {}

  async ngOnInit() {
    await this.getUser();
    if (this.plat.width() > 572) {
      this.sizeMe = false;
    } else {
      this.sizeMe = true;
    }
  }

  ngOnDestroy(): void {
    // URL.revokeObjectURL();
  }

  async getUser() {
    this.ready = false;
    await this.userService.getUserDetails(async (response) => {
      if (response) {
        await (this.user = response.data);
        console.log(this.user);
        const formOptions: AbstractControlOptions = {
          validators: match('password', 'confirmPassword'),
        };

        this.userForm = this.fb.group(
          {
            Fname: [response.data.name, [Validators.required]],
            Lname: [response.data.surname, [Validators.required]],
            initials: [response.data.initials, [Validators.required]],
            // phone_number: ['',[Validators.required]],
            email: [response.data.email, [Validators.required]],
            password: ['', [Validators.nullValidator]],
            confirmPassword: ['', [Validators.nullValidator]],
          },
          formOptions
        );

        this.srcFile = 'data:image/png;base64,' + response.data.signature;
        this.ready = true;
      }
    });
  }

  submit() {
    let use = this.userForm.value;
    if (use.password === '') {
      //if the user hasnt changed the password
    }
    console.log(this.user);
  }

  back() {
    this.router.navigate(['home']);
  }
}
