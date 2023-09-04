/** @format */

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import OneSignal from 'onesignal-cordova-plugin';

import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class PushService {
  isCordova = true;

  constructor(public httpClient: HttpClient, public platform: Platform) {
    if (this.platform.is('cordova') || this.platform.is('capacitor')) {
      this.isCordova = true;
    } else {
      this.isCordova = false;
    }
  }
  //** 푸쉬 아이디 발부 **//
  async getId() {
    if (this.platform.is('cordova') || this.platform.is('capacitor')) {
      // return this.oneSignal.getIds();
      return new Promise<{ userId: string }>((resolve) => {
        OneSignal.getDeviceState(({ userId }) => {
          resolve({ userId });
        });
      });
    }
  }

  sendPush(
    pushIds: any,
    title: string,
    message: string,
    data: {
      type: string;
      typeId: string;
      typeId2?: string;
    }
  ) {
    return new Promise((resolve, reject) => {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
        }),
      };
      var payload = {
        app_id: '117a4d4e-eb86-4f47-a76b-e7f372d06f95',
        contents: { en: message },
        headings: { en: title },
        data: { data },
        include_player_ids: pushIds,
        android_channel_id: '108d6ced-654e-4c28-8e1f-2fc0b84d6c13',
      };
      if (pushIds?.length > 0) {
        this.httpClient
          .post(
            'https://onesignal.com/api/v1/notifications',
            payload,
            httpOptions
          )
          .subscribe(
            (new_data) => {
              resolve(new_data);
            },
            (error) => {
              reject(error);
            }
          );
      }
    });
  }
}
