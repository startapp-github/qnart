/** @format */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import {
  ActionSheetController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { FeedService, Item } from 'src/app/services/feed.service';
import { CommentCorrectPage } from '../comment-correct/comment-correct.page';
import { FeedWritePage } from '../feed-write/feed-write.page';
import { ImageModalPage } from '../image-modal/image-modal.page';
import { Comment } from 'src/app/models/comment.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { DbService, leftJoinDocument } from 'src/app/services/db.service';
import { first, map } from 'rxjs/operators';
import { User } from 'src/app/models/user.models';
import { UserService } from 'src/app/services/user.service';
import { ChatService } from 'src/app/services/chat.service';
import { AlarmService } from 'src/app/services/alarm.service';
import { PushService } from 'src/app/services/push.service';

@Component({
  selector: 'app-feed-detail',
  templateUrl: './feed-detail.page.html',
  styleUrls: ['./feed-detail.page.scss'],
})
export class FeedDetailPage implements OnInit {
  likeClicked = false;
  myComment = '인정합니다! %%';
  post: Item;
  commentText = '';
  commentsSubject: BehaviorSubject<Comment[] | undefined> = new BehaviorSubject(
    undefined
  );
  postId: string;
  comments$: Observable<Comment[]>;
  type;
  constructor(
    public navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    private alert: AlertService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private router: Router,
    public dataService: DataService,
    public db: DbService,
    private feedService: FeedService,
    private userService: UserService,
    private cs: ChatService,
    private alarmService: AlarmService,
    private push: PushService
  ) {
    this.route.queryParams.subscribe(async (params) => {
      if (params && !params.post) {
        if (params.type) {
          this.type = params.type;
          this.updateCheckPost(this.post);
          this.dataService
            .getFeedTypePostByPostId(params.post)
            .then((postData) => {
              this.post = postData;
            });
          this.comments$ = this.dataService.getFeedTypeComments$(this.post);
        }
      } else {
        if (params && params.post) {
          this.post = JSON.parse(params.post);
          this.type = params.type;
          this.updateCheckPost(this.post);
          if (this.type == 'home') {
            this.comments$ = this.commentItems(this.post.id);
          } else {
            this.comments$ = this.dataService.getFeedTypeComments$(this.post);
          }
        }
      }

      ////파람즈 타입 삭제
      this.router.navigate([]);
    });
  }

  ngOnInit() {
    this.dataService.inIt();
  }

  ionViewWillEnter() {
    this.dataService.getFeedTypePostByPostId(this.post.id).then((postData) => {
      this.post = postData;
    });
  }

  trackById(idx, comment) {
    return comment.id;
  }

  commentItems(postId): Observable<any> {
    return this.feedService.watchItems().pipe(
      map((arr) => {
        let find = arr?.find((item) => item.id == postId);

        return find ? find.comments : [];
      }),
      leftJoinDocument(this.db.afs, 'userId', 'users'),
      map((arr: any) => {
        let comments = arr.filter((item) => item.type == 'comment');
        return comments.map((item) => {
          let recomments = arr.filter(
            (comment) =>
              comment.type == 'recomment' && comment.refCommentId == item.id
          );
          return { ...item, recomments };
        });
      })
    );
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

  updateCheckPost(post) {
    const findCheck = this.post.data.checkedUsers.find(
      (item) => item == this.dataService.userId
    );
    if (!findCheck) {
      this.post.data.checkedUsers = [
        ...this.post.data.checkedUsers,
        this.dataService.userId,
      ];
      this.post.data.checkUserNumber++;
      this.feedService.updateFeed(post);
      this.dataService.updateCheckPost(post.id);
    }
  }

  checkClass(images) {
    switch (images.length) {
      case 2:
        return 'nth-2';
      case 1:
        return '';
      case 0:
        return 'none-img';
      default:
        return 'nth-3';
    }
  }

  // 좋아요버튼
  likeToggle() {
    const findLike = this.post.data.likedUsers.find(
      (item) => item == this.dataService.userId
    );
    if (!findLike) {
      this.post.data.likedUsers = [
        ...this.post.data.likedUsers,
        this.dataService.userId,
      ];
      this.feedService.updateFeed(this.post);
      this.dataService.addLikedPost(this.post.id);
      this.alert.presentToast('좋아요한 글에 저장되었습니다', 'toast', 1000);
    } else {
      this.post.data.likedUsers = this.post.data.likedUsers.filter(
        (userId) => userId != this.dataService.userId
      );
      this.feedService.updateFeed(this.post);
      this.dataService.removeLikedPost(this.post.id);
      this.alert.presentToast('좋아요한 글에서 제거되었습니다', 'toast', 1000);
    }
  }

  checkLike() {
    const findLike = this.post.data.likedUsers.find(
      (item) => item == this.dataService.userId
    );
    if (findLike) {
      return true;
    } else {
      return false;
    }
  }

  // 좋아요버튼
  likeCommentToggle(comment) {
    const findLike = comment.likedUsers.find(
      (item) => item == this.dataService.userId
    );
    if (!findLike) {
      comment.likedUsers = [...comment.likedUsers, this.dataService.userId];
      const index = this.post.comments?.findIndex(
        (item) => item.id == comment.id
      );
      this.post.comments[index].likedUsers = comment.likedUsers;
      this.feedService.updateFeed(this.post);
      this.dataService.addLikedComment(comment.id);
    } else {
      comment.likedUsers = comment.likedUsers.filter(
        (userId) => userId != this.dataService.userId
      );
      const index = this.post.comments?.findIndex(
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

  // 내 게시글
  async myFeedSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      cssClass: 'actionsheet',
      buttons: [
        {
          text: '삭제하기',
          handler: () => {
            this.deleteFeedAlert();
          },
        },
        {
          text: '수정하기',
          handler: () => {
            this.feedModal();
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

  //  내 댓글
  async myCommentSheet(comment: Comment) {
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

  //  내 댓글
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

  // 상대방 게시글, 댓글
  async userCommentSheet(comment: Comment) {
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
            const user = comment.userId as User;
            this.cs.createChat(user, true);

            // this.navCtrl.navigateForward(['/chatting-detail']);
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

  async userPostSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      cssClass: 'actionsheet',
      buttons: [
        {
          text: '신고하기',
          handler: () => {
            this.goFeedReport('게시글', this.post);
          },
        },
        {
          text: '이 회원의 글 숨기기',
          handler: () => {
            this.hideUserAlert(this.post.createdBy.id);
          },
        },
        {
          text: '대화하기',
          handler: () => {
            const user = this.post.createdBy;
            this.cs.createChat(user, true);

            // this.navCtrl.navigateForward(['/chatting-detail']);
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

  // 이미지 크게 보기
  async imagesMoreModal(images) {
    const modal = await this.modalCtrl.create({
      component: ImageModalPage,
      componentProps: { images: images },
    });

    await modal.present();
  }

  checkCreator() {
    if (this.post.createdBy.id == this.dataService.userId) {
      return true;
    } else {
      return false;
    }
  }

  checkCommentCreator(comment) {
    if (comment.userId.id == this.dataService.userId) {
      return true;
    } else {
      return false;
    }
  }

  // 이미지 수정
  async feedModal() {
    const modal = await this.modalCtrl.create({
      component: FeedWritePage,
      componentProps: { post: this.post },
    });
    await modal.present();
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
        const index = this.post.comments?.findIndex(
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

  async addComment() {
    const id = await this.db.createFsId();

    const updateComment: Comment = {
      id: id,
      text: this.commentText,
      postId: this.post.id,
      dateCreated: new Date().toISOString(),
      type: 'comment',
      userId: this.dataService.userId,
      refCommentId: '',
      likedUsers: [],
      blockedUsers: [],
    };

    const newAlarm = {
      userId: this.post.createdBy.id,
      title: '작성하신 게시물에 새로운 댓글이 달렸습니다.',
      content: this.commentText,
      data: {
        type: 'comment',
        typeId: this.post.id,
        typeId2: updateComment.id,
      },
    };
    const recievedUser: User = await this.db
      .doc$(`users/${newAlarm.userId}`)
      .pipe(first())
      .toPromise();
    if (!recievedUser.blockedUsers?.includes(this.userService.userData.id)) {
      if (
        !recievedUser.exitSwitch &&
        recievedUser.pushSwitch &&
        recievedUser.pushId.length > 0
      ) {
        this.push
          .sendPush(
            recievedUser.pushId,
            '댓글 알림',
            '새로운 댓글이 작성되었어요.',
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
      '새로운 댓글이 작성되었어요.',
      newAlarm.content,
      newAlarm.data
    );
    this.post.comments = [updateComment, ...this.post.comments];
    this.feedService.updateFeed(this.post);
    this.dataService.updateComment(updateComment);
    this.commentText = '';
  }

  showOption(comment: Comment) {
    const isCreator = this.checkCommentCreator(comment);
    if (isCreator) {
      this.myCommentSheet(comment);
    } else {
      this.userCommentSheet(comment);
    }
  }

  showOptionRecomment(recomment: Comment) {
    const isCreator = this.checkCommentCreator(recomment);
    if (isCreator) {
      this.myRecommentSheet(recomment);
    } else {
      this.userCommentSheet(recomment);
    }
  }

  showPostOption() {
    const isCreator = this.checkCreator();
    if (isCreator) {
      this.myFeedSheet();
    } else {
      this.userPostSheet();
    }
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
      this.feedService.updateFeed(this.post);
      await this.db.delete(`comments/${recomment.id}`);
      await this.alert.presentToast(
        '해당 답글이 삭제되었습니다.',
        'toast',
        1000
      );
    }
  }

  // 내 댓글 삭제 Alert
  async deleteCommentAlert(comment) {
    console.log('deleteCommentAlert', comment);

    const ok = await this.alert.cancelOkBtn(
      'alert confirm',
      `댓글을 삭제하시겠습니까?`
    );
    if (ok) {
      if (comment.recomments) {
        const promises = comment.recomments.map(async (recomment) => {
          await this.db.updateAt(`deletedComments`, recomment);
          const index = this.post.comments?.findIndex(
            (item) => item.id == recomment.id
          );
          this.post.comments.splice(index, 1);
          return this.db.delete(`comments/${recomment.id}`);
        });
        await Promise.all(promises);
        delete comment.recomments;
      }
      await this.db.updateAt(`deletedComments`, comment);
      const index2 = this.post.comments?.findIndex(
        (item) => item.id == comment.id
      );
      this.post.comments.splice(index2, 1);
      this.feedService.updateFeed(this.post);
      await this.db.delete(`comments/${comment.id}`);
      await this.alert.presentToast(
        '해당 댓글이 삭제되었습니다.',
        'toast',
        1000
      );
    }
  }

  // 내 게시물 삭제 Alert
  deleteFeedAlert() {
    this.alert
      .cancelOkBtn('alert confirm', `게시물을 삭제하시겠습니까?`)
      .then(async (ok) => {
        if (ok) {
          await this.db.updateAt(`deletedPosts`, this.post.data);
          await this.db.delete(`posts/${this.post.id}`);
          this.feedService.removeFeed(this.post);
          await this.alert.presentToast(
            '해당 게시물이 삭제되었습니다.',
            'toast',
            1000
          );
          this.navCtrl.back();
        }
      });
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

  // 답글쓰기
  goFeedReply(comment: Comment) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        comment: JSON.stringify(comment),
        post: JSON.stringify(this.post),
      },
    };
    this.navCtrl.navigateForward(['/feed-reply'], navigationExtras);
  }

  goBack() {
    this.navCtrl.back();
  }
}
