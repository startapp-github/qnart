/** @format */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import {
  ActionSheetController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { first, take } from 'rxjs/operators';
import { Comment } from 'src/app/models/comment.model';
import { User } from 'src/app/models/user.models';
import { AlarmService } from 'src/app/services/alarm.service';
import { AlertService } from 'src/app/services/alert.service';
import { ChatService } from 'src/app/services/chat.service';
import { DataService } from 'src/app/services/data.service';
import { DbService } from 'src/app/services/db.service';
import { FeedService, Item } from 'src/app/services/feed.service';
import { PushService } from 'src/app/services/push.service';
import { UserService } from 'src/app/services/user.service';
import { CommentCorrectPage } from '../comment-correct/comment-correct.page';

@Component({
  selector: 'app-feed-reply',
  templateUrl: './feed-reply.page.html',
  styleUrls: ['./feed-reply.page.scss'],
})
export class FeedReplyPage implements OnInit {
  comment: Comment;
  post: Item;
  recommentText;
  constructor(
    public navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    private alert: AlertService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private dataService: DataService,
    private feedService: FeedService,
    private userService: UserService,
    private db: DbService,
    private cs: ChatService,
    private alarmService: AlarmService,
    private push: PushService
  ) {
    this.route.queryParams.subscribe(async (params) => {
      await this.userService.inIt();
      if (params && params.type) {
        const post = await this.db
          .doc$(`posts/${params.postId}`)
          .pipe(take(1))
          .toPromise();

        console.log({ post });

        let postData;
        let comment;
        if (post && Object.keys(post).length < 2) {
          postData = false;
          comment = false;
        } else {
          postData = await this.dataService.getFeedTypePostByPostId(
            params.postId
          );
          comment = await this.dataService.getFeedTypeComment(
            postData,
            params.commentId
          );
        }

        console.log('postData', postData);
        console.log('comment', comment);

        if (!postData || !comment) {
          this.alert.presentAlert('알림', '이미 삭제된 게시글입니다.');
          this.navCtrl.back();
        }

        this.comment = comment;
        this.post = postData;
      } else {
        if (params && params.comment) {
          await this.userService.inIt();
          this.comment = JSON.parse(params.comment);
          this.post = JSON.parse(params.post);
        }
      }
    });
  }

  ngOnInit() {}

  checkCommentCreator(comment) {
    if (comment.userId.id == this.dataService.userId) {
      return true;
    } else {
      return false;
    }
  }

  showOption(comment: Comment) {
    const isCreator = this.checkCommentCreator(comment);
    if (isCreator) {
      this.myCommentSheet(comment);
    } else {
      this.userCommentSheet(comment);
    }
  }

  //  내 댓글
  async myCommentSheet(comment) {
    const actionSheet = await this.actionSheetCtrl.create({
      cssClass: 'actionsheet',
      buttons: [
        {
          text: '삭제하기',
          handler: () => {
            this.deleteCommentAlert(comment);
          },
        },
        {
          text: '수정하기',
          handler: () => {
            this.commentModal(comment);
          },
        },
        {
          text: '취소',
          role: 'cancel',
          cssClass: 'sheet-cancel',
          handler: () => {},
        },
      ],
    });
    await actionSheet.present();
  }
  async deleteCommentAlert(comment) {
    console.log('comment', comment);

    const ok = await this.alert.cancelOkBtn(
      'alert confirm',
      `댓글을 삭제하시겠습니까?`
    );
    if (ok) {
      if (comment.recomments) {
        const promises = comment.recomments.map(async (recomment) => {
          await this.db.updateAt(`deletedComments`, recomment);
          const index = this.post.comments.findIndex(
            (item) => item.id == recomment.id
          );
          this.post.comments.splice(index, 1);
          return this.db.delete(`comments/${recomment.id}`);
        });
        await Promise.all(promises);
        delete comment.recomments;
      }
      await this.db.updateAt(`deletedComments`, comment);
      const index2 = this.post.comments.findIndex(
        (item) => item.id == comment.id
      );
      await this.db.delete(`comments/${comment.id}`);
      await this.alert.presentToast(
        '해당 댓글이 삭제되었습니다.',
        'toast',
        1000
      );
      this.post.comments.splice(index2, 1);
      this.feedService.updateFeed(this.post);
      this.goBack();
    }
  }

  trackById(idx, comment) {
    return comment.id;
  }

  showOptionRecomment(recomment: Comment) {
    const isCreator = this.checkCommentCreator(recomment);
    if (isCreator) {
      this.myRecommentSheet(recomment);
    } else {
      this.userCommentSheet(recomment);
    }
  }
  async myRecommentSheet(recomment: Comment) {
    const actionSheet = await this.actionSheetCtrl.create({
      cssClass: 'actionsheet',
      buttons: [
        {
          text: '삭제하기',
          handler: () => {
            this.deleteRecommentAlert(recomment);
          },
        },
        {
          text: '수정하기',
          handler: () => {
            this.commentModal(recomment);
          },
        },
        {
          text: '취소',
          role: 'cancel',
          cssClass: 'sheet-cancel',
          handler: () => {},
        },
      ],
    });
    await actionSheet.present();
  }

  async deleteRecommentAlert(recomment: Comment) {
    const ok = await this.alert.cancelOkBtn(
      'alert confirm',
      `답글을 삭제하시겠습니까?`
    );
    if (ok) {
      await this.db.updateAt(`deletedComments`, recomment);
      const index = this.post.comments?.findIndex(
        (item) => item.id == recomment.id
      );

      this.post.comments.splice(index, 1);
      const index2 = this.comment.recomments?.findIndex(
        (item) => item.id == recomment.id
      );
      this.comment.recomments.splice(index2, 1);
      this.feedService.updateFeed(this.post);
      await this.db.delete(`comments/${recomment.id}`);
      await this.alert.presentToast(
        '해당 답글이 삭제되었습니다.',
        'toast',
        1000
      );
    }
  }

  // 상대방 댓글
  async userCommentSheet(comment) {
    const actionSheet = await this.actionSheetCtrl.create({
      cssClass: 'actionsheet',
      buttons: [
        {
          text: '신고하기',
          handler: () => {
            this.goFeedReport('댓글', this.post, comment);
          },
        },
        {
          text: '이 회원의 글 숨기기',
          handler: () => {
            const user = comment.userId as User;
            this.hideUserAlert(user.id);
          },
        },
        {
          text: '대화하기',
          handler: () => {
            const user = comment.userId;

            this.cs.createChat(user, true);
            this.navCtrl.navigateForward(['/chatting-detail']);
          },
        },
        {
          text: '취소',
          role: 'cancel',
          cssClass: 'sheet-cancel',
          handler: () => {},
        },
      ],
    });
    await actionSheet.present();
  }

  // 신고하기
  goFeedReport(type: string, post: Item, comment?: Comment) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        post: JSON.stringify(post),
        comment: JSON.stringify(comment),
        type,
      },
    };
    this.navCtrl.navigateForward(['/feed-report'], navigationExtras);
  }

  // 댓글 수정
  async commentModal(comment) {
    const modal = await this.modalCtrl.create({
      component: CommentCorrectPage,
      componentProps: { myComment: comment.text },
      cssClass: 'comment-modal',
      backdropDismiss: false,
    });
    await modal.present();
    modal.onDidDismiss().then(async (data) => {
      if (data.data) {
        const index = this.post.comments.findIndex(
          (item) => item.id == comment.id
        );
        comment.text = data.data;
        this.post.comments[index].text = comment.text;
        this.feedService.updateFeed(this.post);
        this.db.updateAt(`comments/${comment.id}`, { text: data.data });
        await this.alert.presentToast(
          '해당 댓글이 수정었습니다.',
          'toast',
          1000
        );
      }
    });
  }

  likeCommentToggle(comment) {
    const findLike = comment.likedUsers.find(
      (item) => item == this.dataService.userId
    );
    if (!findLike) {
      comment.likedUsers = [...comment.likedUsers, this.dataService.userId];
      const index = this.post.comments.findIndex(
        (item) => item.id == comment.id
      );
      this.post.comments[index].likedUsers = comment.likedUsers;
      this.feedService.updateFeed(this.post);
      this.dataService.addLikedComment(comment.id);
    } else {
      comment.likedUsers = comment.likedUsers.filter(
        (userId) => userId != this.dataService.userId
      );
      const index = this.post.comments.findIndex(
        (item) => item.id == comment.id
      );
      this.post.comments[index].likedUsers = comment.likedUsers;
      this.feedService.updateFeed(this.post);
      this.dataService.removeLikedComment(comment.id);
    }
  }

  checkLikeComment(comment) {
    const findLike = comment.likedUsers.find(
      (item) => item == this.dataService.userId
    );
    if (findLike) {
      return true;
    } else {
      return false;
    }
  }

  async addReComment() {
    const id = await this.db.createFsId();

    const updateComment: Comment = {
      id,
      text: this.recommentText,
      postId: this.post.id,
      dateCreated: new Date().toISOString(),
      type: 'recomment',
      userId: this.dataService.userId,
      refCommentId: this.comment.id,
      likedUsers: [],
      blockedUsers: [],
    };
    const updateReComment: Comment = {
      id,
      text: this.recommentText,
      postId: this.post.id,
      dateCreated: updateComment.dateCreated,
      userId: this.userService.userData as User,
      refCommentId: this.comment.id,
      likedUsers: [],
      blockedUsers: [],
      type: 'recomment',
    };
    this.comment.recomments
      ? this.comment.recomments.unshift(updateReComment)
      : [updateReComment];
    this.post.comments = [updateComment, ...this.post.comments];
    const newAlarm = {
      userId: this.post.createdBy.id,
      title: '작성하신 댓글에 새로운 답글이 달렸습니다.',
      content: this.recommentText,
      data: {
        type: 'comment',
        typeId: this.post.id,
        typeId2: this.comment.id,
      },
    };
    const recievedUser: User = await this.db
      .doc$(`users/${newAlarm.userId}`)
      .pipe(first())
      .toPromise();
    if (this.userService.userData.id !== (this.comment.userId as User).id) {
      if (!recievedUser.blockedUsers.includes(this.userService.userData.id)) {
        if (
          !recievedUser.exitSwitch &&
          recievedUser.pushSwitch &&
          recievedUser.pushId.length > 0
        ) {
          this.push
            .sendPush(
              recievedUser.pushId,
              '답글 알림',
              '새로운 답글이 작성되었어요.',
              {
                type: 'comment',
                typeId: this.post.id,
                typeId2: updateComment.id,
              }
            )
            .then((e) => {
              console.log('push', e);
            });
        }
      }

      this.alarmService.sendAlarm(
        newAlarm.userId,
        this.dataService.getCategoryNameById(this.post.data.categoryId),
        '새로운 답글이 작성되었어요.',
        newAlarm.content,
        newAlarm.data
      );
    }

    this.feedService.updateFeed(this.post);
    this.dataService.updateComment(updateComment);
    this.recommentText = '';
  }

  // 게시물 숨기기 Alert
  async hideUserAlert(userId) {
    let ok = await this.alert.cancelOkBtn(
      'alert confirm',
      `이 회원의 모든 게시물 및 댓글을 숨길까요?<br>이 동작은 취소할 수 없습니다.`
    );

    if (ok) {
      this.userService.updateBlockUser(userId);
      await this.alert.presentToast(
        '해당 회원이 차단처리되었습니다.',
        'toast',
        1000
      );
    }
  }

  checkBlockedUser(userId) {
    const find = this.userService.userData.blockedUsers?.find(
      (item) => item == userId
    );
    if (find) {
      return true;
    }
    return false;
  }

  goBack() {
    this.navCtrl.navigateBack(['/feed-detail']);
  }
}
