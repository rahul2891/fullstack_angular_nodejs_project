import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null; // let `Validators.required` own the empty case

    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const isLongEnough = value.length >= 8;

    const valid = hasUppercase && hasNumber && isLongEnough;
    return valid
      ? null
      : { strongPassword: { hasUppercase, hasNumber, isLongEnough } };
  };
}

export function passwordsMatchValidator(
  passwordKey: string,
  confirmKey: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    if (!password || !confirm) return null;
    return password === confirm ? null : { passwordMismatch: true };
  };
}

/** Simple key-format validator for the project "key" field, e.g. "PB", "INFRA". */
export function projectKeyFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;
    const valid = /^[A-Za-z]{2,6}$/.test(value);
    return valid ? null : { projectKeyFormat: true };
  };
}