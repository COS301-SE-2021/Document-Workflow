import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { UserAPIService } from '../User/user-api.service';

// export function verifyEmail(controlName: string, userService: UserAPIService){

//   return async (group: AbstractControl) => {
//     const formGroup = <FormGroup>group;
//     const control = formGroup.controls[controlName];

//     if (control.errors && !control.errors.verifyEmail)   {
//       return null;
//     }
//     // // set error on matchingControl if validation fails
//     if (await userService.verifyEmail(control.value) === false) {
//       control.setErrors({verifyEmail: true});
//     } else {
//       console.log('here')
//       control.setErrors(null);
//     }
//     return null;
//   };
// }

export class VerifyEmail {
  constructor(private userService: UserAPIService) {}

  verifyEmail(control: FormControl) {
    return new Promise((resolve) => {
      this.userService.verifyEmail(control.value).subscribe((response) => {
        if (response) {
          return resolve({ verifyEmail: true });
        } else {
          return resolve(null);
        }
      });
    });

    //   console.log("made it here")
    //   return async (group: AbstractControl) => {
    //   const formGroup = <FormGroup>group;
    //   const control = formGroup.controls[controlName];

    //   if (control.errors && !control.errors.verifyEmail)   {
    //     return null;
    //   }
    //   // // set error on matchingControl if validation fails
    //   if (await this.userService.verifyEmail(control.value) === false) {
    //     control.setErrors({verifyEmail: true});
    //   } else {
    //     console.log('here')
    //     control.setErrors(null);
    //   }
    //   return null;
    // };
  }
}

// import { AbstractControl, FormGroup } from '@angular/forms';

// export function match(controlName: string, matchingContent: string) {
//   return (group: AbstractControl) => {
//     const formGroup = <FormGroup>group;
//     const control = formGroup.controls[controlName];
//     const matchingControl = formGroup.controls[matchingContent];

//     if (matchingControl.errors && !matchingControl.errors.mustMatch) {
//       // return if another validator has already found an error on the matchingControl
//       return null;
//     }
//     // set error on matchingControl if validation fails
//     if (control.value !== matchingControl.value) {
//       matchingControl.setErrors({ mustMatch: true });
//     } else {
//       matchingControl.setErrors(null);
//     }

//     return null;
//   };
// }
