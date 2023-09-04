/** @format */

import { NavController } from '@ionic/angular';
/** @format */

import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { DbService, getUsersById } from './db.service';
import { Platform } from '@ionic/angular';
import { LoadingService } from './loading.service';
import { AlertService } from './alert.service';
import { AuthService } from './auth.service';
import { User } from 'src/app/models/user.models';
import { DataService } from './data.service';
import { FIREBASE_REFERENCES } from 'src/app/core/firebase/firebase.module';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  userData$: Observable<User | null>;
  public userData: User;
  currentUid;
  isBackgroundChange = false;
  private blockUsersSubject: BehaviorSubject<string[] | undefined> =
    new BehaviorSubject(undefined);

  private _userData: BehaviorSubject<User | undefined> = new BehaviorSubject(
    undefined
  );

  constructor(
    @Inject(FIREBASE_REFERENCES.ONE_FIREAUTH) public afAuth: AngularFireAuth,
    private authService: AuthService,
    public db: DbService,
    public router: Router,
    public platform: Platform,
    public loadingService: LoadingService,
    public alertService: AlertService,
    public nav: NavController,
    private dataService: DataService
  ) {
    this.authService.afAuth.authState.subscribe((user) => {
      console.log({ user });

      if (user) {
        this.inIt();
      }
    });
  }
  //** 유저 서비스 init  **//
  async inIt() {
    return new Promise(async (resolve) => {
      await this.dataService.inIt();
      if (this.userData) {
        resolve(true);
      }
      this.userData = await this.authService.getUser();
      this.blockUsersSubject.next(this.userData.blockedUsers);

      this._userData.next(this.userData);
      resolve(true);
    });
  }

  //** 유저서비스 reinit **//
  async reInit() {
    this.userData = await this.authService.getUser();
    if (this.userData) {
      // }
    }
  }

  //** 유저정보 업데이트  **//
  async updateUserData(updateDate: object, message?) {
    await this.db.updateAt(`users/${this.userData.id}`, updateDate);
    this.userData = { ...this.userData, ...updateDate };
    this.alertService.toast(
      message ? message : '회원정보가 업데이트 되었습니다.',
      'toast'
    );
    await this.reInit();
  }

  getBlockUserList$(): Observable<any> {
    return this.blockUsersSubject
      .asObservable()
      .pipe(getUsersById(this.db.afs));
  }

  updateBlockUser(blockedUserId) {
    this.userData.blockedUsers = this.userData.blockedUsers
      ? [...this.userData.blockedUsers, blockedUserId]
      : [blockedUserId];
    this._userData.next(this.userData);
    this.blockUsersSubject.next(this.userData.blockedUsers);
    return this.dataService.updateBlockUser(blockedUserId);
  }

  removeBlockUser(blockedUserId) {
    this.userData.blockedUsers = this.userData.blockedUsers.filter(
      (blockedUser) => blockedUser != blockedUserId
    );
    this._userData.next(this.userData);
    this.blockUsersSubject.next(this.userData.blockedUsers);
    return this.dataService.removeBlockUser(blockedUserId);
  }

  addInterestedCategory(categoryId) {
    this.userData.intestedCategory = this.userData.intestedCategory
      ? [...this.userData.intestedCategory, categoryId]
      : [categoryId];
    this._userData.next(this.userData);
    this.dataService.addInterestedCategory(categoryId);
  }

  removeInterestedCategory(categoryId) {
    this.userData.intestedCategory = this.userData.intestedCategory.filter(
      (item) => item !== categoryId
    );
    this._userData.next(this.userData);
    this.dataService.removeInterestedCategory(categoryId);
  }

  watchUserData(): Observable<User> {
    return this._userData.asObservable();
  }

  //** 데이터 초기화  **//
  removeAll() {
    this.userData = null;
    this.currentUid = null;
    this.dataService.userId = null;
  }
}
