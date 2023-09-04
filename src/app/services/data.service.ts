/** @format */

import { Injectable } from '@angular/core';
import * as firebase from 'firebase/compat/app';
import * as moment from 'moment';
import { combineLatest, Observable, of } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { Appservice } from 'src/app/models/appService.model';
import { Category } from 'src/app/models/category.model';
import { Comment } from 'src/app/models/comment.model';
import { Inquiry } from 'src/app/models/inquiry.model';
import { Post } from 'src/app/models/post.model';
import { User } from 'src/app/models/user.models';
import { appSolutionInfo } from 'src/clientInfo/client-info';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { CommonService } from './common.service';

import {
  DbService,
  getAlarmData,
  getComments,
  getLikedPosts,
  getOnePostComments,
  leftJoinDocument,
  leftJoinOneDocument,
} from './db.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  userId: string;
  categories: Category[] = JSON.parse(localStorage.getItem('categoires'))
    ? JSON.parse(localStorage.getItem('categoires'))
    : [];
  userData: User;
  appService: Appservice;
  type: Array<'community' | 'chat' | 'mall'> = ['community', 'chat', 'mall'];

  constructor(
    public db: DbService,
    public common: CommonService,
    public auth: AuthService
  ) {}

  //** 데이터 서비스 init **//
  async inIt() {
    return new Promise(async (resolve) => {
      if (this.appService) {
        resolve('success');
      }
      this.userId = localStorage.getItem('userId');
      this.userData = await this.db
        .doc$(`users/${this.userId}`)
        .pipe(first())
        .toPromise();

      this.categories = await this.getAllCategories();
      this.appService = await this.getAppService();
      localStorage.setItem('categoires', JSON.stringify(this.categories));
      resolve('success');
    });
  }

  getAppClientData() {
    let clientId = appSolutionInfo.clientId;

    console.log({ clientId });

    return this.db
      .adminDoc$(`appSolutionUser/${clientId}`)
      .pipe(first())
      .toPromise();
  }

  getAppService() {
    return this.db.doc$(`appService/terms`).pipe(first()).toPromise();
  }

  getCategoryNameById(categoryId: string) {
    let category = this.categories.find((item) => item.id == categoryId);
    if (category) {
      return category.name;
    }
    return '';
  }

  getAllCategories() {
    return this.db
      .collection$(`categories`, (ref) => ref.orderBy('order', 'asc'))
      .pipe(
        map((arr) => {
          return arr.map((item) => {
            let find = this.userData.intestedCategory?.find(
              (category) => category == item.id
            );
            return { checked: find ? true : false, ...item };
          });
        }),
        first()
      )
      .toPromise();
  }

  //** 이름으로 사용자 데이터 가져오기  **//
  checkUsername(nickName: string) {
    return this.db.collection$(`users`, (ref) =>
      ref.where('nickName', '==', nickName)
    );
  }

  addInterestedCategory(categoryId: string) {
    return this.db.updateAt(`users/${this.userId}`, {
      intestedCategory:
        firebase.default.firestore.FieldValue.arrayUnion(categoryId),
    });
  }

  removeInterestedCategory(categoryId: string) {
    return this.db.updateAt(`users/${this.userId}`, {
      intestedCategory:
        firebase.default.firestore.FieldValue.arrayRemove(categoryId),
    });
  }

  updateInquiry(title: string, text: string) {
    const updateData: Inquiry = {
      dateCreated: new Date().toISOString(),
      userId: this.userId,
      isAnswer: false,
      text,
      title,
      answer: '',
      dateAnswerd: '',
    };
    return this.db.updateAt(`inquiries`, updateData);
  }

  getInquiriesByUserId() {
    return this.db
      .collection$(`inquiries`, (ref) =>
        ref
          .where('deleteSwitch', '==', false)
          .where('userId', '==', this.userId)
          .orderBy('dateCreated', 'desc')
      )
      .pipe(first())
      .toPromise();
  }

  getAllFaqs() {
    return this.db
      .collection$(`faqs`, (ref) => ref.orderBy('order', 'asc'))
      .pipe(first())
      .toPromise();
  }

  getInquiryById(inquiryId: string) {
    return this.db.doc$(`inquiries/${inquiryId}`).pipe(first()).toPromise();
  }

  deleteInquiryById(inquiryId: string) {
    // return this.db.delete(`inquiries/${inquiryId}`);
    return this.db.updateAt(`inquiries/${inquiryId}`, { deleteSwitch: true });
  }

  updateCheckPost(postId: string) {
    return this.db.updateAt(`posts/${postId}`, {
      checkedUsers: firebase.default.firestore.FieldValue.arrayUnion(
        this.userId
      ),
      checkUserNumber: firebase.default.firestore.FieldValue.increment(1),
    });
  }

  updateComment(comment: Comment) {
    return this.db.updateAt(`comments/${comment.id}`, comment);
  }

  async addLikedPost(postId: string) {
    const likedPost = {
      postId: postId,
      dateLiked: new Date().toISOString(),
    };
    await this.db.updateAt(`users/${this.userId}`, {
      likedPosts: firebase.default.firestore.FieldValue.arrayUnion(likedPost),
    });
    return this.db.updateAt(`posts/${postId}`, {
      likedUsers: firebase.default.firestore.FieldValue.arrayUnion(this.userId),
    });
  }

  async removeLikedPost(postId: string) {
    const userData = await this.db
      .doc$(`users/${this.userId}`)
      .pipe(first())
      .toPromise();
    const likedPosts = userData.likedPosts ? userData.likedPosts : [];
    const removeArr = likedPosts.filter((item) => item.postId != postId);
    await this.db.updateAt(`users/${this.userId}`, {
      likedPosts: removeArr,
    });
    return this.db.updateAt(`posts/${postId}`, {
      likedUsers: firebase.default.firestore.FieldValue.arrayRemove(
        this.userId
      ),
    });
  }

  addLikedComment(commentId: string) {
    return this.db.updateAt(`comments/${commentId}`, {
      likedUsers: firebase.default.firestore.FieldValue.arrayUnion(this.userId),
    });
  }

  removeLikedComment(commentId: string) {
    return this.db.updateAt(`comments/${commentId}`, {
      likedUsers: firebase.default.firestore.FieldValue.arrayRemove(
        this.userId
      ),
    });
  }

  updateBlockUser(blockUserId: string) {
    return this.db.updateAt(`users/${this.userId}`, {
      blockedUsers:
        firebase.default.firestore.FieldValue.arrayUnion(blockUserId),
    });
  }

  removeBlockUser(blockUserId: string) {
    return this.db.updateAt(`users/${this.userId}`, {
      blockedUsers:
        firebase.default.firestore.FieldValue.arrayRemove(blockUserId),
    });
  }

  getAllContentsWrittenByUser() {
    const posts = this.db
      .collection$(`posts`, (ref) =>
        ref.where('createdBy', '==', this.userId).where('isDisplay', '==', true)
      )
      .pipe(
        map((arr) => {
          return arr.map((item) => {
            return { ...item, type: 'post' };
          });
        })
      );
    const comments = this.db
      .collection$(`comments`, (ref) => ref.where('userId', '==', this.userId))
      .pipe(
        leftJoinDocument(this.db.afs, 'postId', 'posts'),
        map((arr: any) => {
          return arr.map((item) => {
            return {
              ...item,
              type: 'comment',
              postCreatedBy: item.postId.createdBy,
            };
          });
        }),
        leftJoinDocument(this.db.afs, 'postCreatedBy', 'users')
      );
    const allContens = combineLatest<any[]>(posts, comments)
      .pipe(
        map((arr) => {
          const newArray = arr.reduce((acc, cur) => acc.concat(cur));
          return newArray.sort((a, b) => {
            const d1 = new Date(a.dateCreated);
            const d2 = new Date(b.dateCreated);
            return d1 > d2 ? -1 : d2 > d1 ? 1 : 0;
          });
        }),
        first()
      )
      .toPromise();
    return allContens;
  }

  async getFeedTypePostByPostId(postId): Promise<any> {
    const postData = this.db.afs
      .doc(`posts/${postId}`)
      .snapshotChanges()
      .pipe(
        map((doc) => {
          const data: Post = doc.payload.data() as Post;
          const id = doc.payload.id;
          const createdBy = data.createdBy;
          const ref = doc.payload.ref;
          return {
            id,
            createdBy,
            ref,
            data,
          };
        }),
        leftJoinOneDocument(this.db.afs, 'createdBy', 'users'),
        getOnePostComments(this.db.afs),
        first()
      )
      .toPromise();
    return postData;
  }

  async getFeedTypeComment(postData, commentId) {
    const post$ = of(postData.comments);
    const comment$ = post$
      .pipe(
        leftJoinDocument(this.db.afs, 'userId', 'users'),
        map((arr: any) => {
          let comments = arr.filter((item) => item.type == 'comment');
          const commentList = comments.map((item) => {
            let recomments = arr.filter(
              (comment) =>
                comment.type == 'recomment' && comment.refCommentId == item.id
            );
            return { ...item, recomments };
          });
          const selectComment = commentList.find(
            (item) =>
              item.id == commentId ||
              item.recomments?.find((recomment) => recomment.id == commentId)
          );
          return selectComment;
        }),
        first()
      )
      .toPromise();
    return comment$;
  }

  getFeedTypeComments$(postData): Observable<any> {
    const post$ = of(postData.comments).pipe(
      leftJoinDocument(this.db.afs, 'userId', 'users')
    );
    const comment$ = post$.pipe(
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
    return comment$;
  }

  // getLikedPosts() {
  //   return this.db
  //     .doc$(`users/${this.userId}`)
  //     .pipe(getLikedPosts(this.db.afs), first())
  //     .toPromise();
  // }

  async getLikedPosts() {
    const posts = await this.getAllPosts();
    const datas: any = await this.db
      .doc$(`users/${this.userId}`)
      .pipe(getLikedPosts(this.db.afs), first())
      .toPromise();

    if (posts.length) {
      return datas.filter((data) =>
        posts.find((post) => data.postId.id === post.id)
      );
    } else {
      return [];
    }
  }

  async getAllPosts(): Promise<any> {
    const posts = this.db
      .collection$(`posts`, (ref) => ref.where('isDisplay', '==', true))
      .pipe(getComments(this.db.afs), first())
      .toPromise();
    return posts;
  }

  getAlarms$() {
    const startDate = moment().add(-15, 'd').format('YYYY-MM-DD');
    const date1 = new Date(startDate);
    date1.setDate(date1.getDate() - 10);
    const start = firebase.default.firestore.Timestamp.fromDate(date1);
    console.log('this.userId', this.userId);

    return this.db
      .collection$(`alarms`, (ref) =>
        ref
          .where('userId', '==', this.userId)
          .where('date', '>=', start)
          .orderBy('date', 'desc')
      )
      .pipe(
        map((alarms) => {
          console.log('alarms', alarms);
          return alarms.map((alarm) => {
            if (alarm.type == 'admin') {
              alarm['category'] = '관리자';
            }

            if (alarm.type === 'alarm') {
              alarm['category'] = '알림';
            }
            return alarm;
          });
        })
      )
      .pipe(getAlarmData(this.db.afs));
    // FIXME getAlarmData() 코드 수정 필요함.
  }

  getAllNotices() {
    return this.db
      .collection$(`notices`, (ref) => ref.orderBy('dateCreated', 'desc'))
      .pipe(first())
      .toPromise();
  }

  getNoticesById(noticeId: string) {
    return this.db.doc$(`notices/${noticeId}`).pipe(first()).toPromise();
  }
}
