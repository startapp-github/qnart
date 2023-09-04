/** @format */

import { NavController } from '@ionic/angular';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/compat/app';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  switchMap,
  take,
  map,
  first,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import { DbService } from './db.service';
import { Platform } from '@ionic/angular';
import { LoadingService } from './loading.service';
import { AlertService } from './alert.service';
import { User } from 'src/app/models/user.models';
import { FIREBASE_REFERENCES } from 'src/app/core/firebase/firebase.module';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;
  userData$: Observable<User | null>;
  _userData = new BehaviorSubject(null);
  userData: User;
  currentUid;
  constructor(
    @Inject(FIREBASE_REFERENCES.ONE_FIREAUTH) public afAuth: AngularFireAuth,
    public db: DbService,
    public router: Router,
    public platform: Platform,
    public loadingService: LoadingService,
    public alertService: AlertService,
    public nav: NavController
  ) {
    // this.user$ = this.afAuth.authState.pipe(
    //   switchMap((user) => (user ? db.doc$(`users/${user.uid}`) : of(null)))
    // );
    // this.redirect();
    // this.handleRedirect();
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => (user ? db.doc$(`users/${user.uid}`) : of(null)))
    );

    this.afAuth.authState.subscribe((data) => {
      if (data) {
        localStorage.setItem('userId', data.uid);

        //이용정지 계정
        this.user$
          .pipe(
            distinctUntilChanged(
              (prev, curr) => prev.activeSwitch === curr.activeSwitch
            ),
            debounceTime(300)
          )
          .subscribe((data) => {
            console.log(data);
            if (!data.activeSwitch) {
              this.logoutUser().then(() => {
                this.alertService
                  .okCantDismissBtn('', '이용 정지된 계정입니다.')
                  .then((ok) => {
                    this.nav.navigateBack('/login');
                  });
              });
            }
          });
      } else {
        // 예외사항 고려
        // localStorage.clear();
      }
    });
  }

  //** 유저 정보 가져오기 **//
  getUser(): Promise<any> {
    return this.user$.pipe(first()).toPromise();
  }

  //** 유저정보 가져오기 **//
  uid() {
    return this.afAuth.authState
      .pipe(
        take(1),
        map((u) => u && u.uid)
      )
      .toPromise();
  }

  //** 로그아웃 처리 **//
  async signOut() {
    await firebase.default.auth().signOut();
    return this.nav.navigateRoot(['/'], {
      animated: true,
      animationDirection: 'back',
    });
  }

  //** 회원가입 처리 **//
  registerUser(email, password) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth
        .createUserWithEmailAndPassword(email, password)
        .then((res) => {
          localStorage.setItem('userId', res.user.uid);
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  //** 이메일 회원가입 **//
  loginUser(email, password) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.signInWithEmailAndPassword(email, password).then(
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  }

  //** 로그아웃 **//
  logoutUser() {
    return new Promise((resolve, reject) => {
      if (this.afAuth.currentUser) {
        this.afAuth
          .signOut()
          .then(() => {
            localStorage.clear();
            resolve(true);
          })
          .catch((error) => {
            let code = error['code'];
            this.alertService.showErrorMessage(code);

            reject(code);
          });
      }
    });
  }

  emailLogin(obj) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        var r = await this.afAuth.signInWithEmailAndPassword(
          obj.email,
          obj.password
        );
        if (r) {
          const user = r.user;
          // localStorage.setItem('userId', user.uid);
          resolve(user);
        }
      } catch (error) {
        const code = error['code'];
        reject(code);
      }
    });
  }

  //**  유저 정보 가져오기 **//
  // userDetails() {
  //   return firebase.default.auth().currentUser;
  // }

  //** 리다이렉트 **//
  // redirect() {
  //   firebase.default.auth().onAuthStateChanged((user) => {
  //     if (user) {
  //       this.currentUid = user.uid;
  //       sessionStorage.setItem('authUser', JSON.stringify(user));
  //     } else {
  //       sessionStorage.removeItem('authUser');
  //     }
  //   });
  // }

  //**  리다이렉트 처리 **//
  // public async handleRedirect() {
  //   if (Boolean(this.isRedirect())) {
  //     return null;
  //   }
  //   const result = await firebase.default.auth().getRedirectResult();
  //   if (result.user) {
  //   }

  //   await this.setRedirect('false');
  //   return result;
  // }

  setRedirect(val) {
    localStorage.setItem('authRedirect', val);
  }

  isRedirect() {
    return localStorage.getItem('authRedirect');
  }

  loginAuthCheck;

  exitUser() {
    return new Promise((resolve, reject) => {
      const user = firebase.default.auth().currentUser;
      this.db
        .updateAt(`users/${user.uid}`, { exitSwitch: true, pushId: [] })
        .then(() => {
          user
            .delete()
            .then((hi) => {
              localStorage.clear();
              resolve(true);
            })
            .catch((error) => {});
        })
        .catch((error) => {});
    });
  }

  //**  비밀번호 재설정 이메일 발송 **//
  sendPasswordReset(email) {
    return new Promise((resolve, reject) => {
      // this.loadingService.load("비밀번호 재설정 메일을 발송중입니다.");
      return this.afAuth
        .sendPasswordResetEmail(email)
        .then((success) => {
          // this.loadingService.hide();
          // this.alertService.presentAlert("비밀번호 재설정", "이메일으로 비밀번호 재설정 이메일이 전송되었습니다. 이메일을 확인해 주세요.");
          resolve(success);
        })
        .catch((error) => {
          let code = error['code'];
          // this.alertService.showErrorMessage(code);

          reject(code);
        });
    });
  }

  //**  비밀번호 변경 **//
  async changePassword(newPassword) {
    return new Promise((resolve, reject) => {
      this.afAuth.currentUser.then((user) => {
        user
          .updatePassword(newPassword)
          .then((success) => {
            resolve(success);
          })
          .catch((error) => {
            let code = error['code'];
            this.alertService.showErrorMessage(code);

            reject(code);
          });
      });
    });
  }
}
