import { AbstractControl, FormGroup } from '@angular/forms';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function match(controlName: string, matchingContent: string) {
  return (group: AbstractControl) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const formGroup = <FormGroup>group;
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingContent];

    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      // return if another validator has already found an error on the matchingControl
      return null;
    }
    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }

    return null;
  };
}
