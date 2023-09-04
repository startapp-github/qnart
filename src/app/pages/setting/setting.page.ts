/** @format */

import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { User } from 'src/app/models/user.models';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  userData: User;

  constructor(
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private alert: AlertService,
    private alertService: AlertService,
    public authService: AuthService,
    public userService: UserService
  ) {}

  async ngOnInit() {
    await this.userService.inIt();
    this.userData = this.userService.userData;
  }

  updateUserData() {
    if (
      this.userService.userData.marketingAgreement !=
        this.userData.marketingAgreement ||
      this.userService.userData.pushSwitch != this.userData.pushSwitch
    ) {
      this.userService.updateUserData({
        marketingAgreement: this.userData.marketingAgreement,
        pushSwitch: this.userData.pushSwitch,
      });
    }
  }

  // 로그아웃 Alert
  userLogoutAlert() {
    this.alert
      .cancelOkBtn('alert confirm', `로그아웃 하시겠습니까?`)
      .then(async (ok) => {
        if (ok) {
          await this.authService.logoutUser();
          await this.userService.removeAll();
          localStorage.clear();
          // this.navCtrl.navigateRoot(['/login']);
          this.navCtrl.navigateRoot(['/tabs/mall']);
          this.alert.presentToast(
            '정상적으로 로그아웃 되었습니다.',
            'toast',
            1000
          );
        }
      });
  }

  // 회원탈퇴 Alert
  async userSignOutAlert() {
    const alert = await this.alertCtrl.create({
      header: '회원탈퇴',
      message: `회원탈퇴를 위해 비밀번호를 입력해주세요. 비밀번호 확인 후 즉시 탈퇴됩니다.`,
      cssClass: 'alert head input lh',
      backdropDismiss: false,
      inputs: [
        {
          type: 'password',
          placeholder: '현재 비밀번호',
        },
      ],
      buttons: [
        {
          text: '확인',
          role: 'ok',
          handler: (data) => {
            this.authService
              .loginUser(this.userService.userData.email, data['0'])
              .then(async () => {
                await this.authService.exitUser();
                await this.userService.removeAll();
                localStorage.clear();
                this.navCtrl.navigateRoot('/login');
                this.alertService.okBtn(
                  'alert alert-common',
                  '회원탈퇴 처리되었습니다.'
                );
              })
              .catch(() =>
                this.alertService.okBtn(
                  'alert alert-common',
                  '비밀번호가 일치하지 않습니다.'
                )
              );
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

  // 회원탈퇴가 되었을 경우
  goSignOut() {
    this.navCtrl.navigateRoot(['/login']).then(() => {
      this.alert.presentToast(
        '정상적으로 회원탈퇴 처리되었습니다.',
        'toast',
        1000
      );
    });
  }

  // 비밀번호가 틀렸을 경우
  notMatchPassword() {
    this.alert
      .okBtn('alert', `비밀번호가 일치하지 않습니다.\n다시 입력해 주세요.`)
      .then(() => {
        this.userSignOutAlert();
      });
  }

  // 차단사용자관리
  goBlackList() {
    this.navCtrl.navigateForward(['/black-list']);
  }

  // 개인정보
  goPersoanlInfo() {
    this.navCtrl.navigateForward(['/personal-info']);
  }

  // 서비스이용약관
  goService() {
    this.navCtrl.navigateForward(['/service']);
  }

  goChangePassword() {
    this.navCtrl.navigateForward(['/change-password']);
  }
}
