import { AlertController } from '@ionic/angular';
/** @format */

import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  Router,
} from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    public router: Router,
    public navCtrl: NavController,
    public auth: AuthService,
    public alertController: AlertController
  ) {}

  uid;
  ngOnInit(): void {}
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const uid = await this.auth.uid();

    const isLoggedIn = !!uid;
    console.log('uid', uid);

    if (!uid) {
      console.log('this.router.url', this.router.url);

      if (this.router.url === '/' || this.router.url.includes('tabs/home')) {
        this.navCtrl.navigateRoot('/tabs/mall');
      } else {
        this.needRegister();
        return false;
      }
    } else {
      return true;
    }
  }
  async needRegister() {
    const alert = await this.alertController.create({
      cssClass: 'alert confirm',
      message: '로그인 후 이용 가능한 서비스 입니다.\n 로그인 하시겠습니까?',
      buttons: [
        {
          text: '취소',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: '로그인',
          handler: () => {
            this.navCtrl.navigateForward(['/login']);
          },
        },
      ],
    });
    await alert.present();
  }
}
