/** @format */

import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';
@Injectable({
  providedIn: 'root',
})
export class AuthGuard2 implements CanActivate {
  constructor(
    public auth: AuthService,
    public router: Router,
    public navCtrl: NavController,
    public db: DbService,
    public platform: Platform
  ) {}
  //** 로그인 여부 체크 **//
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return this.platform.ready().then(async (e) => {
      const uid = await this.auth.uid();
      console.log('uid', uid);

      const isLoggedIn = !!uid;

      if (isLoggedIn) {
        this.navCtrl.navigateRoot(['/']);
        return false;
      } else {
        return true;
      }
    });
  }
}
