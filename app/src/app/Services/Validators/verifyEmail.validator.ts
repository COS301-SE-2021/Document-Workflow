import { AbstractControl, FormGroup } from '@angular/forms';
import { UserAPIService } from '../User/user-api.service';

export function verifyEmail(controlName: string, userService: UserAPIService){

  return async (group: AbstractControl) => {
    const formGroup = <FormGroup>group;
    const control = formGroup.controls[controlName];

    if (control.errors) {
      return null;
    }
    // // set error on matchingControl if validation fails
    if (await userService.verifyEmail(control.value) === false) {
      control.setErrors({verifyEmail: false});
    } else {
      control.setErrors(null);
    }
    return null;
  };
}
