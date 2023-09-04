/** @format */

import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { User } from 'src/app/models/user.models';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {
  presentPw: string;
  newPw: string;
  confirmPw: string;
  user: User;
  constructor(
    private alert: AlertService,
    public navCtrl: NavController,
    private loader: LoadingService,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  // 현재비밀번호와 새비밀번호가 같은 경우
  passwordMatchError() {
    this.alert.okBtn(
      'alert',
      `동일한 비밀번호입니다.\n 다른 비밀번호로 변경하여 주세요.`
    );
  }

  // 완료
  passwordChange() {
    this.navCtrl.back();
    this.alert.presentToast('비밀번호 변경이 완료되었습니다.', 'toast', 1000);
  }

  validation(type: string) {
    const passRule = /^.*(?=^.{6,}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[0-9]).*$/;

    const passwordReg = {
      present: passRule.test(this.presentPw),
      new: passRule.test(this.newPw),
    };

    return passwordReg[type] || false;
  }

  comparePwd() {
    return this.newPw === this.confirmPw;
  }

  //비밀번호 변경하기
  async changeBtn() {
    this.loader.load();
    this.user = await this.authService.getUser();
    this.authService
      .emailLogin({ email: this.user.email, password: this.presentPw })
      .then(async () => {
        this.loader.hide();

        await this.authService.changePassword(this.confirmPw);

        // 현재 비밀번호와 일치하는 경우
        this.navCtrl.navigateRoot(['/setting'], {
          animationDirection: 'back',
        });
        this.PasswordComplete();
      })
      .catch(() => {
        this.loader.hide();
        this.errorPassword();
      });
  }

  //가입된 비밀번호 오류 알럿
  async errorPassword() {
    this.alert.okBtn('alert', `비밀번호가 틀렸습니다.\n 다시 입력해 주세요.`);
  }

  //변경 완료 알럿
  async PasswordComplete() {
    this.alert.toast('비밀번호가 변경되었습니다.');
  }
}
