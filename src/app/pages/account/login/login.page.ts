/** @format */

import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, Platform } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { PushService } from 'src/app/services/push.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string;
  password: string;
  constructor(
    private loadingService: LoadingService,
    public navCtrl: NavController,
    private alertService: AlertService,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private userService: UserService,
    private db: DbService,
    private push: PushService,
    private platform: Platform
  ) {}

  ngOnInit() {}

  async login() {
    this.loadingService.load();
    const success = await this.authService
      .loginUser(this.email, this.password)
      .catch((error) => {
        this.loadingService.hide();
        this.alertService.showErrorMessage(error.code);
      });
    if (success) {
      await this.userService.inIt();

      if (this.platform.is('cordova') || this.platform.is('capacitor')) {
        this.setPushId(success.user.uid)
          .then(() => {
            this.loadingService.hide();
            this.goHome();
          })
          .catch(() => {
            this.loadingService.hide();
            this.goHome();
          });
      } else {
        this.loadingService.hide();
        this.goHome();
      }
    }
  }

  //** 푸쉬아이디 세팅 **//
  setPushId(uid) {
    return new Promise((resolve, reject) => {
      // TODO 차후 push 연동하면 활성화해야 합니다.
      this.push
        .getId()
        .then(
          (data: any) => {
            if (
              data &&
              this.userService.userData.pushId.includes(data.userId)
            ) {
              resolve(true);
            } else {
              const pushId = data.userId;
              if (pushId) {
                this.db
                  .updateAt(`users/${uid}`, {
                    pushId:
                      firebase.default.firestore.FieldValue.arrayUnion(pushId),
                  })
                  .then(() => {
                    resolve(true);
                  });
              } else {
                resolve(true);
              }
            }
          },
          (error) => {
            console.log('error', error);
          }
        )
        .catch((err) => {
          reject(err);
        });

      // resolve(true);
    });
  }

  // (로그인)이메일, 비밀번호가 일치하지 않은 경우
  notMatchUserAlert() {
    this.alertService.okBtn(
      'alert',
      `이메일 또는 비밀번호가 일치하지 않습니다. \n다시 입력해 주세요.`
    );
  }

  // (로그인)가입된 이메일이 아닌 경우
  notSignUserAlert() {
    this.alertService.okBtn('alert', `가입된 이메일이 아닙니다.`);
  }

  // 비밀번호 찾기 Alert
  async findPasswordAlert() {
    const alert = await this.alertCtrl.create({
      header: '비밀번호 찾기',
      message: `이메일을 입력해 주세요.\n해당 이메일로 비밀번호 변경 안내를 전송해 드립니다.`,
      cssClass: 'alert head input',
      backdropDismiss: false,
      inputs: [
        {
          type: 'email',
          placeholder: '이메일',
        },
      ],
      buttons: [
        {
          text: '확인',
          role: 'ok',
          handler: (data) => {
            console.log('data', data);
            this.sendEmail(data[0]);
          },
        },
        {
          text: '취소',
          role: 'cancel',
          cssClass: 'alert-cancel',
          handler: () => {
            console.log('취소');
          },
        },
      ],
    });

    await alert.present();
  }

  //** 비밀번호 찾기 이메일 발송 **//
  async sendEmail(email) {
    await this.loadingService.load();
    this.authService
      .sendPasswordReset(email)
      .then((success) => {
        console.log({ success });
        this.loadingService.hide();
        this.alertService.okBtn(
          'alert',
          '메일이 전송되었습니다.\n인증 메일 확인이 안 될 경우, \n스팸메일함을 확인해 주세요.'
        );
      })
      .catch((error) => {
        console.log({ error });
        this.loadingService.hide();
        this.alertService.showErrorMessage(error);
      });
  }

  //홈
  goHome() {
    this.navCtrl.navigateRoot(['/tabs/home']);
    this.alertService.presentToast('로그인에 성공하였습니다.', 'toast', 1000);
  }
  // 회원가입
  goSignUp() {
    this.navCtrl.navigateForward(['/sign-up']);
  }
}
