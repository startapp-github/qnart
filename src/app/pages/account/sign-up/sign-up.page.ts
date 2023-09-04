/** @format */

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavController, Platform } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { take } from 'rxjs/operators';
import { User } from 'src/app/models/user.models';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { PushService } from 'src/app/services/push.service';
import { UserService } from 'src/app/services/user.service';
import { Validator } from 'src/validator';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  termsAll: boolean;
  service: boolean = false;
  privacy: boolean = false;
  marketing: boolean = false;
  signUpForm: FormGroup;
  nickNameAvailable: boolean;
  agreeAllTerms = false;
  newUser: User;

  constructor(
    public navCtrl: NavController,
    private alertService: AlertService,
    public formBuilder: FormBuilder,
    private db: DbService,
    private dataService: DataService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private userService: UserService,
    private push: PushService,
    private platform: Platform
  ) {
    this.signUpForm = formBuilder.group(
      {
        nickName: Validator.nicknameValidator,
        email: Validator.emailValidator,
        password: Validator.passwordValidator,
        confirm_password: Validator.confirm_passwordValidator,
        serviceTerms: Validator.serviceTermsValidator,
        personalInfo: Validator.personalInfoValidator,
        marketing: Validator.marketingValidator,
      },
      {
        validator: this.matchingPasswords('password', 'confirm_password'),
      }
    );
  }

  ngOnInit() {}
  //** 닉네임 체크 **//
  checkNickname() {
    this.dataService
      .checkUsername(this.signUpForm.value['nickName'])
      .pipe(take(1))
      .subscribe((nickname) => {
        console.log('nickname', nickname);
        this.nickNameAvailable = nickname.length > 0 ? false : true;

        if (nickname.length) {
          this.duplicateNicknameAlert();
        } else {
          this.useNicknameAlert();
        }
      });
  }

  //** 바말번호 확인 **//
  matchingPasswords(passwordKey, confirmPasswordKey) {
    return (group: FormGroup): { [key: string]: any } => {
      let password = group.controls[passwordKey];
      let confirm_password = group.controls[confirmPasswordKey];

      if (password.value !== confirm_password.value) {
        return {
          mismatchedPasswords: true,
        };
      }
    };
  }

  checkAgreeAll(num) {
    if (this.agreeAllTerms && num == 0) {
      this.signUpForm.controls['serviceTerms'].setValue(true);
      this.signUpForm.controls['personalInfo'].setValue(true);
      this.signUpForm.controls['marketing'].setValue(true);
    } else if (
      num == 0 &&
      this.signUpForm.value['serviceTerms'] &&
      this.signUpForm.value['personalInfo'] &&
      this.signUpForm.value['marketing']
    ) {
      this.signUpForm.controls['serviceTerms'].setValue(false);
      this.signUpForm.controls['personalInfo'].setValue(false);
      this.signUpForm.controls['marketing'].setValue(false);
    }
    if (
      this.signUpForm.value['serviceTerms'] &&
      this.signUpForm.value['personalInfo'] &&
      this.signUpForm.value['marketing'] &&
      num !== 0
    ) {
      this.agreeAllTerms = true;
    } else if (num !== 0) {
      this.agreeAllTerms = false;
    }
  }

  // 닉네임 중복 Alert
  duplicateNicknameAlert() {
    this.alertService.okBtn('alert', `중복된 닉네임입니다.`);
  }

  // 닉네임 사용가능 Alert
  useNicknameAlert() {
    this.alertService.okBtn('alert', `사용 가능한 닉네임입니다.`);
  }

  // 회원가입완료 Alert
  CompletionSignUpAlert() {
    this.alertService
      .okBtn(
        'alert head',
        `인증 메일이 전송되었습니다.\n인증 완료 후 로그인 하시면 됩니다\n인증 메일 확인이 안 될 경우,\n스팸메일함을 확인해 주세요.`,
        '회원가입완료'
      )
      .then(() => {
        this.navCtrl.navigateRoot(['/login']);
      });
  }

  //** 푸쉬아이디 세팅 **//
  setPushId(uid) {
    return new Promise((resolve, reject) => {
      // TODO 차후 push 연동하면 활성화해야 합니다.
      //   this.push
      //     .getId()
      //     .then((data: any) => {
      //       const pushId = data.userId;
      //       if (pushId) {
      //         // this.db
      //         //   .updateAt(`users/${uid}`, {
      //         //     pushId:
      //         //       firebase.default.firestore.FieldValue.arrayUnion(pushId),
      //         //   })
      //         //   .then(() => {
      //         //     resolve(pushId);
      //         //   });
      //         resolve([pushId]);
      //       } else {
      //         resolve([]);
      //       }
      //     })
      //     .catch((err) => {
      //       reject(err);
      //     });
      resolve([]);
    });
  }

  //** 회원등록 **//
  async register() {
    await this.loadingService.load();
    let resister = await this.authService
      .registerUser(
        this.signUpForm.value['email'],
        this.signUpForm.value['password']
      )
      .catch((error) => {
        this.loadingService.hide();
        this.alertService.showErrorMessage(error.code);
      });
    if (resister) {
      let pushId = [];
      if (this.platform.is('cordova') || this.platform.is('capacitor')) {
        console.log('pushId 1', pushId);

        pushId = (await this.setPushId(resister.user.uid)) as string[];
        console.log('pushId', pushId);
      }
      const intestedCategory = await this.dataService.categories.map(
        (item) => item.id
      );
      let createdUser: User = {
        uid: resister.user.uid,
        exitSwitch: false,
        email: this.signUpForm.value['email'],
        loginType: 'email',
        dateCreated: new Date().toISOString(),
        activeSwitch: true,
        nickName: this.signUpForm.value['nickName'],
        profileImage: 'assets/imgs/avatar.png',
        marketingAgreement: this.signUpForm.value['marketing'],
        privacyAreement: this.signUpForm.value['personalInfo'],
        serviceAreement: this.signUpForm.value['serviceTerms'],
        pushSwitch: true,
        blockedUsers: [],
        likedPosts: [],
        intestedCategory: intestedCategory,
        pushId: pushId ? pushId : [],
        recipient: '',
        address: '',
        addressDetail: '',
        deliveryPhone: '',
        postCode: '',
        recentKeyword: [],
        cartCount: 0,
      };

      await this.db.updateAt(`users/${createdUser.uid}`, createdUser);
      this.loadingService.hide();
      await this.userService.inIt();
      this.goHome();
    }
  }

  //홈
  goHome() {
    this.navCtrl.navigateRoot(['/tabs/home']);
    this.alertService.presentToast('회원가입에 성공하였습니다.', 'toast', 1000);
  }

  // 서비스이용약관
  goService() {
    this.navCtrl.navigateForward(['/service']);
  }

  // 개인정보
  goPersoanlInfo() {
    this.navCtrl.navigateForward(['/personal-info']);
  }
}
