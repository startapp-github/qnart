/** @format */

import { Validators, FormGroup, FormControl } from '@angular/forms';

export namespace Validator {
  // Set your validators here, don't forget to import and use them in the appropriate class that uses formGroups.
  // In this example, they are used on LoginPage where a formGroup for email and passwords is used.
  export const emailValidator = [
    '',
    [
      Validators.minLength(5),
      Validators.required,
      Validators.pattern(
        '^[a-z0-9]+(.[_a-z0-9]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,15})$'
      ),
    ],
  ];
  export const email1Validator = [
    '',
    [
      // Validators.required,
      Validators.pattern('^[a-z0-9]+(.[_a-z0-9]+)$'),
    ],
  ];
  export const email2Validator = [
    '',
    [
      // Validators.required,
      Validators.pattern('^@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,15})$'),
    ],
  ];
  export const email3Validator = [
    '',
    [
      // Validators.required,
      Validators.pattern('^[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,15})$'),
    ],
  ];
  export const passwordValidator = [
    '',
    [Validators.minLength(6), Validators.required],
  ];

  export const passwordValidator2 = [
    '',
    [
      Validators.minLength(5),
      Validators.required,
      Validators.pattern(
        '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{6,}$'
      ),
    ],
  ];

  export class PasswordValidator {
    static areEqual(formGroup: FormGroup) {
      let val;
      let valid = true;

      for (let key in formGroup.controls) {
        if (formGroup.controls.hasOwnProperty(key)) {
          let control: FormControl = <FormControl>formGroup.controls[key];
          if (val == undefined) {
            val = control.value;
          } else {
            if (val !== control.value) {
              valid = false;
              break;
            }
          }
        }
      }
      if (valid) {
        return null;
      }
      return {
        areEqual: true,
      };
    }
  }

  export const confirm_passwordValidator = ['', Validators.required];

  export const nicknameValidator = [
    '',
    [
      Validators.maxLength(10),
      Validators.minLength(2),
      Validators.required,
      Validators.pattern('^[ㄱ-ㅎ가-힣a-zA-Z0-9]*$'),
    ],
  ];
  export const serviceTermsValidator = [false, [Validators.pattern('true')]];
  export const personalInfoValidator = [false, [Validators.pattern('true')]];

  export const marketingValidator = [false];

  // Set your prompt input validators here, don't forget to import and use them on the AlertController prompt.
  // In this example they are used by home.ts where the user are allowed to change their profile.
  // errorMessages are used by the AlertProvider class and is imported inside AlertProvider.errorMessages which is used by showErrorMessage().
  export const profileNameValidator = {
    maxLength: 7,
    lengthError: {
      title: '닉네임/이름 오류!!',
      subTitle: '닉네임/이름은 최대 7자까지 입력가능합니다.',
    },
    pattern: /^[a-zA-Z0-9\s]*$/g,
    patternError: {
      title: '닉네임/이름 오류!',
      subTitle: '닉네임/이름은 한글, 영문, 숫자만 입력가능합니다.',
    },
  };
  export const profileEmailValidator = {
    pattern:
      /^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$/g,
    patternError: {
      title: 'Invalid Email Address!',
      subTitle: 'Sorry, but the email you have entered is invalid.',
    },
  };
  export const profilePasswordValidator = {
    minLength: 5,
    lengthError: {
      title: '비밀번호 오류!',
      subTitle: '비밀번호는 최소 6자 이상으로 설정해주시기 바랍니다.',
    },
    pattern: /^[a-zA-Z0-9!@#$%^&*()_+-=]*$/g,
    patternError: {
      title: '비밀번호 오류!',
      subTitle: '비밀번호에 특수기호가 포함되어 있습니다.',
    },
  };
  // Group Form Validators
  export const groupNameValidator = [
    '',
    [Validators.required, Validators.minLength(1)],
  ];
  export const groupDescriptionValidator = [
    '',
    [Validators.required, Validators.minLength(1)],
  ];
}
