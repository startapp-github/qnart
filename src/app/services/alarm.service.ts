/** @format */

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Alarm } from 'src/app/models/alarm.model';
import { PushDetailComponent } from '../pages/push-detail/push-detail.component';
import { CommonService } from './common.service';
import { DataService } from './data.service';
import { DbService } from './db.service';

@Injectable({
  providedIn: 'root',
})
export class AlarmService {
  constructor(
    private common: CommonService,
    private db: DbService,
    public navController: NavController,
    private dataService: DataService,
    public dialog: MatDialog
  ) {}

  async sendAlarm(
    userId: string,
    category: string,
    title: string,
    content: string,
    data: {
      type: string;
      typeId: string;
      typeId2: string;
    }
  ) {
    let alarm: Alarm = {
      id: this.common.generateFilename(),
      dateCreated: new Date().toISOString(),
      title,
      content,
      category,
      checkSwitch: false,
      type: data.type,
      typeId: data.typeId,
      typeId2: data.typeId2,
      userId,
      date: new Date(),
    };

    await this.db.updateAt(`alarms/${alarm.id}`, alarm);
  }

  // async moveDetail(type: string, typeId: string, typeId2: string) {
  async moveDetail(item) {
    if (item.type === 'post') {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          postId: item.typeId,
          type: 'alarm',
        },
      };
      this.navController.navigateForward(['/feed-detail'], navigationExtras);
    } else if (item.type === 'comment') {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          type: 'alarm',
          commentId: item.typeId2,
          postId: item.typeId,
        },
      };
      this.navController.navigateForward(['/feed-reply'], navigationExtras);
    } else if (item.type === 'chat') {
      this.navController.navigateForward(['/chatting-detail'], {
        queryParams: { id: item.typeId, type: 'matching' },
      });
    } else if (item.type === 'admin') {
      this.dialog.open(PushDetailComponent, {
        panelClass: 'push-popup',
        data: item,
      });
    } else {
      switch (item.title) {
        case '기획전 업데이트 알림':
          this.navController.navigateForward(['/shop/event-list']);
          break;
        case '새로운 댓글이 작성되었어요.':
          this.navController.navigateForward(['/feed-detail'], {
            queryParams: {
              postId: item.typeId,
              type: 'alarm',
            },
          });
          break;
        case '작성하신 게시물에 새로운 댓글이 달렸습니다.':
          this.navController.navigateForward(['/feed-reply'], {
            queryParams: {
              type: 'alarm',
              commentId: item.typeId2,
              postId: item.typeId,
            },
          });
          break;

        case '리뷰 댓글 알림':
          this.navController.navigateForward(['/shop/review'], {
            queryParams: { type: '리뷰' },
          });
          break;
        case '상품문의 답변 알림':
          this.navController.navigateForward(['/shop/review'], {
            queryParams: { type: '문의' },
          });
          break;

        case '1:1문의 답변 알림':
          this.navController.navigateForward(['/inquiry']);
          break;

        case '공지사항 업데이트 알림':
          this.navController.navigateForward(['/notice']);
          break;

        case '교환 상품 발송 완료':
        case '반품 완료':
          this.navController.navigateForward(['/shop/redund-detail-cart'], {
            queryParams: { id: item.typeId },
          });

          break;

        case '발송 완료':
        case '배송 완료':
          this.navController.navigateForward(['/shop/order-list-detail'], {
            queryParams: { id: item.typeId },
          });
          break;

        default:
          break;
      }
    }
  }

  createPost() {}

  createdComment() {}
}
