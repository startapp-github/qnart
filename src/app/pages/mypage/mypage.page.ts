/** @format */

import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController, NavController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';
import { FeedWritePage } from '../feed-write/feed-write.page';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-mypage',
  templateUrl: './mypage.page.html',
  styleUrls: ['./mypage.page.scss'],
})
export class MypagePage implements OnInit {
  @ViewChild('content') content: IonContent;

  constructor(
    public navCtrl: NavController,
    public userService: UserService,
    public dataService: DataService,
    public modalCtrl: ModalController,
    public alertService: AlertService
  ) {}

  ngOnInit() {
    this.userService.inIt();
  }
  ionViewWillEnter() {
    this.content.scrollToTop();
  }

  // 내가작성한글
  goMyWrite() {
    this.navCtrl.navigateForward(['/my-write']);
  }

  // 좋아요한글
  goMyLike() {
    this.navCtrl.navigateForward(['/my-like']);
  }

  // 관심주제설정
  goMySubject() {
    this.navCtrl.navigateForward(['/my-subject']);
  }

  // 프로필 설정
  goProfileSet() {
    this.navCtrl.navigateForward(['/profile-set']);
  }

  // 1:1문의
  goInquiry() {
    this.navCtrl.navigateForward(['/inquiry']);
  }

  // 자주묻는질문
  goCommonQusetion() {
    this.navCtrl.navigateForward(['/common-question']);
  }

  // 공지사항
  goNotice() {
    this.navCtrl.navigateForward(['/notice']);
  }

  // 설정
  goSetting() {
    this.navCtrl.navigateForward(['/setting']);
  }

  //상품 리뷰/문의
  goReview() {
    this.navCtrl.navigateForward(['/shop/review']);
  }

  //찜한 상품
  goLike() {
    this.navCtrl.navigateForward(['/shop/like']);
  }

  //주문 목록
  goOrderList() {
    this.navCtrl.navigateForward(['/shop/order-list']);
  }

  //취소/교환/반품
  goRefundList() {
    this.navCtrl.navigateForward(['/shop/refund-list']);
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
