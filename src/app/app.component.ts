/** @format */

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { TextZoom } from '@capacitor/text-zoom';
import { AlertService } from 'src/app/services/alert.service';
import { Device } from '@capacitor/device';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';
import { UserService } from './services/user.service';
import OneSignal from 'onesignal-cordova-plugin';
import { appSolutionInfo } from 'src/clientInfo/client-info';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  //백버튼 시간
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;
  constructor(
    private platform: Platform,
    private router: Router,
    public navc: NavController,
    public alert: AlertService,
    private dataService: DataService,
    private userService: UserService
  ) {
    this.initializeApp();
    this.checkExipredService();
  }
  //시작시 세팅
  async initializeApp() {
    ///TODO 안예쁘긴 한데 이게 최선이에요
    this.platform.ready().then(async (data) => {
      this.oneSignalInit();
      this.backbutton();
      //디바이스 정보 가져오기
      const deviceInfo = await Device.getInfo();
      //서버로 돌릴때 진행하지 않기
      if (!this.platform.is('capacitor')) {
        return false;
      }

      //디바이스가 안드로이 12 이상일때 옵션
      if (
        deviceInfo.platform == 'android' &&
        Number(deviceInfo.osVersion) > 11
      ) {
        //유저 폰트 크기 고정
        await TextZoom.set({ value: 1 });

        SplashScreen.hide().then(async (data) => {
          await SplashScreen.show({
            autoHide: false,
          });

          setTimeout(async () => {
            await StatusBar.setBackgroundColor({
              color: '#ffffff',
            });
            await StatusBar.setOverlaysWebView({
              overlay: false,
            });
            await StatusBar.setStyle({
              style: Style.Light,
            });
            await SplashScreen.hide();
          }, 500);
        });
      } else {
        //그외
        await TextZoom.set({ value: 1 });

        await StatusBar.setStyle({
          style: Style.Light,
        });

        if (deviceInfo.platform == 'android') {
          await StatusBar.setBackgroundColor({
            color: '#ffffff',
          });
          await StatusBar.setOverlaysWebView({
            overlay: false,
          });
        }
        await SplashScreen.hide();
      }
    });
  }

  async checkExipredService() {
    const clientData = await this.dataService.getAppClientData();
    console.log('clientData', clientData);

    const today = moment().format('YYYY-MM-DD');
    if (!moment(clientData.expiredDate).isAfter(today)) {
      this.navc.navigateRoot(['/expired-service']);
    }
  }

  backbutton() {
    this.platform.backButton.subscribeWithPriority(0, async () => {
      let url = this.router.url;
      console.log('url', url);

      if (!this.userService.userData) {
        if (url === '/tabs/mall') {
          if (
            new Date().getTime() - this.lastTimeBackPress <
            this.timePeriodToExit
          ) {
            navigator['app'].exitApp();
          } else {
            this.alert.presentToast(
              '다시 한 번 누르면 종료됩니다.',
              'toast',
              1500
            );
            this.lastTimeBackPress = new Date().getTime();
          }
        } else {
          this.navc.pop();
        }
        return;
      }

      switch (url) {
        case '/tabs/chatting':
        case '/tabs/push':
        case '/tabs/mall':
        case '/tabs/mypage':
          {
            this.navc.navigateRoot('/tabs/home');
          }
          break;
        case '/':
        case '/tabs/home': {
          if (
            new Date().getTime() - this.lastTimeBackPress <
            this.timePeriodToExit
          ) {
            navigator['app'].exitApp();
          } else {
            this.alert.presentToast(
              '다시 한 번 누르면 종료됩니다.',
              'toast',
              1500
            );
            this.lastTimeBackPress = new Date().getTime();
          }
          break;
        }
        case '/intro': {
          if (
            new Date().getTime() - this.lastTimeBackPress <
            this.timePeriodToExit
          ) {
            navigator['app'].exitApp();
          } else {
            this.alert.presentToast(
              '다시 한 번 누르면 종료됩니다.',
              'toast',
              1500
            );
            this.lastTimeBackPress = new Date().getTime();
          }
          break;
        }

        default: {
          this.navc.pop();
          break;
        }
      }
    });
  }

  oneSignalInit() {
    if (this.platform.is('desktop') || this.platform.is('mobileweb')) {
      console.log('desktop');

      return false;
    }

    OneSignal.setAppId(appSolutionInfo.oneSignalAppId);
    OneSignal.promptForPushNotificationsWithUserResponse();
    OneSignal.setNotificationOpenedHandler((ev: any) => {
      const data = ev.notification.additionalData;
      if (data) {
      }
    });
  }
}
