/** @format */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { CommentCorrectPage } from '../comment-correct/comment-correct.page';
import { Comment } from 'src/app/models/comment.model';
import { Item } from 'src/app/services/feed.service';
import { DataService } from 'src/app/services/data.service';
import { Report } from 'src/app/models/report.model';
import { DbService } from 'src/app/services/db.service';
import { User } from 'src/app/models/user.models';

@Component({
  selector: 'app-feed-report',
  templateUrl: './feed-report.page.html',
  styleUrls: ['./feed-report.page.scss'],
})
export class FeedReportPage implements OnInit {
  comment: Comment;
  post: Item;
  reason;
  selectReason;
  type;
  constructor(
    private alert: AlertService,
    public navCtrl: NavController,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private dataService: DataService,
    private db: DbService
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params && params.post) {
        this.comment = params.comment ? JSON.parse(params.comment) : '';
        this.post = JSON.parse(params.post);
        this.type = params.type;
        console.log('this.post', this.post);
        console.log('this.type', this.type);

        console.log('this.comment', this.comment);
      }
    });
  }

  ngOnInit() {}

  //내 댓글 수정
  async commentModal() {
    const modal = await this.modalCtrl.create({
      component: CommentCorrectPage,
      cssClass: 'comment-modal',
      backdropDismiss: false,
    });

    await modal.present();
  }

  // 내 댓글 삭제 Alert
  deleteCommentAlert() {
    this.alert.cancelOkBtn('alert confirm', `댓글을 삭제하시겠습니까?`);
  }

  // 신고
  async reportSuc() {
    let updateReport: Report = {
      createdBy: this.dataService.userId,
      type: this.type,
      userId:
        this.type == '댓글'
          ? (this.comment.userId as User).id
          : (this.post.createdBy as User).id,
      refId: this.type == '댓글' ? this.comment.id : this.post.id,
      dateCreated: new Date().toISOString(),
      reason: this.reason,
      selectReason: this.selectReason,
      isCheck: false,
      status: 'report',
    };
    await this.db.updateAt(`reports`, updateReport);
    this.alert.presentToast('신고가 접수되었습니다.', 'toast', 1000);
    this.navCtrl.back();
  }
}
