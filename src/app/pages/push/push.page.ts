/** @format */

import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController, NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { first, map, take } from 'rxjs/operators';
import { AlarmService } from 'src/app/services/alarm.service';
import { DataService } from 'src/app/services/data.service';
import { DbService } from 'src/app/services/db.service';
import { FeedWritePage } from '../feed-write/feed-write.page';
import { UserService } from 'src/app/services/user.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-push',
  templateUrl: './push.page.html',
  styleUrls: ['./push.page.scss'],
})
export class PushPage implements OnInit {
  @ViewChild('content') content: IonContent;

  alarms$: Observable<any>;
  constructor(
    private navCtrl: NavController,
    private db: DbService,
    private dataService: DataService,
    private alarmService: AlarmService,
    private userService: UserService,
    private alertService: AlertService,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    await this.dataService.inIt();
    this.alarms$ = this.dataService.getAlarms$();
    this.alarms$.pipe(take(1)).toPromise();
  }

  ionViewWillEnter() {
    this.content.scrollToTop();
  }

  async goPush(alarm) {
    console.log('alarm', alarm);

    this.db.updateAt(`alarms/${alarm.id}`, { checkSwitch: true });
    this.alarmService.moveDetail(alarm);
  }

  // 게시물작성
  async feedWrite() {
    if (this.userService.userData) {
      const modal = await this.modalCtrl.create({
        component: FeedWritePage,
      });
      await modal.present();
    } else {
      this.alertService.noneUser();
    }
  }
}
