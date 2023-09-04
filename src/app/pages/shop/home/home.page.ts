/** @format */

import { Component, OnInit, ViewChild } from '@angular/core';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

import { IonContent, IonSlides, NavController } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { inAnimation } from 'src/app/animate/ngifAnimate';
import { category } from 'src/app/classes/category';
import { exhibition } from 'src/app/classes/exhibition';
import { Alarm } from 'src/app/models/alarm.model';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ArrayJoin, DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  animations: [inAnimation],
})
export class HomePage implements OnInit {
  @ViewChild('content') content: IonContent;
  @ViewChild('mainSlides', { static: false }) mainSlides: IonSlides;
  public scrollPost: number = 0;

  slideOpts = {
    slidesPerView: 1,
    spaceBetween: 20,
  };

  mainSlide = {
    slidesPerView: 1,
    pager: true,
  };

  cartegory = '';
  banners;
  subBanner;
  mainBanners;
  topCategories: Array<category> = [];
  popularItems: Array<any> | any = [];
  recommendList: Array<any> = [];
  masterInfo: any;
  popularProducts: Array<any> = [];
  exhibitions: Array<exhibition> | any = [];
  alarms$: Observable<Array<Alarm> | any> = of([]);
  mainPagerSwitch: boolean = false;
  slideSwitch: boolean = true;
  slideLoading: boolean = false;
  slidePopularLoading: boolean = false;
  constructor(
    private navc: NavController,
    private db: DbService,
    private loadingService: LoadingService,
    private auth: AuthService,
    private alertService: AlertService,
    private iab: InAppBrowser
  ) {}

  async ngOnInit() {
    // await this.loadingService.load();
    this.getAlarm();
    await this.getBanner();

    this.masterInfo = await this.getMaster();

    let recommendProduct = this.masterInfo.recommendList.reverse();
    if (recommendProduct && recommendProduct.length > 0) {
      recommendProduct = recommendProduct.filter((data) => !data.deleteSwitch);
    }
    this.recommendList = recommendProduct.slice(0, 12);

    this.topCategories = await this.getTopCategory();

    this.cartegory = this.topCategories[0].id; //세그먼트 체인지
    this.exhibitions = await this.getExhibition();

    this.popularProducts = this.masterInfo.popularList.filter((ele) => {
      return (
        ele.topCategory == this.cartegory && !ele.deleteSwitch && ele.showSwitch
      );
    });
    this.popularItems = [...this.popularProducts];

    setTimeout(() => {
      if (this.mainBanners.length > 1) {
        this.mainPagerSwitch = true;
      } else {
        this.mainPagerSwitch = false;
      }

      this.slideLoading = true;

      if (this.popularItems.length > 2) {
        this.slideSwitch = true;
      } else {
        this.slideSwitch = false;
      }

      this.slidePopularLoading = true;

      if (this.loadingService.isLoading) {
        this.loadingService.hide();
      }
    }, 0);
  }

  //알림 개수 가져오기
  getAlarm() {
    this.alarms$ = this.auth.user$.pipe(
      switchMap((user) => {
        if (user) {
          return this.db.collection$(`alarm`, (ref) =>
            ref.where('uid', '==', user.uid).where('confirm', '==', false)
          );
        } else {
          return of([]);
        }
      })
    );
  }

  //배너 데이터 가져오기
  async getBanner(): Promise<void> {
    this.banners = await this.db
      .collection$(`banner`, (ref) => ref.orderBy('dateCreated', 'desc'))
      .pipe(
        map((banners: any) => {
          this.mainBanners = banners.filter((ele) => ele.subBanner == false);
          this.subBanner = banners.filter((ele) => ele.subBanner == true);
        })
      )
      .pipe(take(1))
      .toPromise();
  }

  //인기 / 추천 가져오기
  getMaster(): Promise<any> {
    return this.db
      .doc$('master/masterInfo')
      .pipe(ArrayJoin(this.db.afs, 'popularList', 'product'))
      .pipe(ArrayJoin(this.db.afs, 'recommendList', 'product'))
      .pipe(take(1))
      .toPromise();
  }

  //탑카테고리 가져오기
  getTopCategory(): Promise<Array<category>> {
    return this.db
      .collection$('category', (ref) =>
        ref
          .where('type', '==', 'top')
          .where('deleteSwitch', '==', false)
          .orderBy('dateCreated', 'desc')
      )
      .pipe(take(1))
      .toPromise();
  }

  //기획전 데이터 가져오기//
  getExhibition(): Promise<any> {
    const today = firebase.default.firestore.Timestamp.fromDate(
      new Date(new Date().setHours(0, 0, 0, 0))
    );
    return this.db
      .collection$('exhibition', (ref) => ref.where('endDate', '>', today))
      .pipe(
        map((exhibitions) => {
          exhibitions.map((element) => {
            element.startDate = element.startDate.toDate();
            element.endDate = element.endDate.toDate();
            return element;
          });
          return exhibitions;
        })
      )
      .pipe(take(1))
      .toPromise();
  }

  //인기상품 상위 카테고리 세그먼트 체인지
  async segmentChange() {
    this.slidePopularLoading = false;
    this.popularProducts = [];
    if (!this.loadingService.isLoading) {
      await this.loadingService.load();
    }
    this.popularProducts = this.masterInfo.popularList.filter((ele) => {
      return (
        ele.topCategory == this.cartegory && !ele.deleteSwitch && ele.showSwitch
      );
    });
    // this.popularItems = this.popularProducts.reverse().slice(0, 8);
    // this.popularItems = [...this.popularProducts, ...this.popularProducts];
    this.popularItems = [...this.popularProducts];
    console.log('this.popularItems', this.popularItems);

    if (this.popularItems.length > 2) {
      this.slideSwitch = true;
    } else {
      this.slideSwitch = false;
    }

    this.slidePopularLoading = true;

    if (this.loadingService.isLoading) {
      this.loadingService.hide();
    }
  }

  //배너 url이동
  goUrl(url) {
    let openUrl = '';

    if (url.includes('https://') || url.includes('http://')) {
      openUrl = url;
      // window.open(oepnUrl, '_blank');
      this.iab.create(openUrl, '_system');
    } else {
      this.alertService.okBtn(
        'alert',
        '해당 페이지로 이동할 수 없어요. 잠시후 다시 시도해주세요.'
      );
    }
  }

  onScroll($event) {
    let scrollTop = $event.detail.scrollTop;
    if (scrollTop <= 150) {
      document.getElementById('scroll').classList.remove('active');
    } else {
      document.getElementById('scroll').classList.add('active');
    }
  }

  top() {
    setTimeout(() => {
      this.content.scrollToPoint(0, 0, 500);
    }, 200);
  }

  //알람으로 이동
  // async goAlarm() {
  //   this.navc.navigateForward(['/push']);
  // }

  // 카테고리 메뉴로 이동
  goCategory() {
    this.navc.navigateForward('/shop/category');
  }

  // 장바구니로 이동
  goBasket() {
    this.navc.navigateForward('/shop/basket');
  }

  //인기상품으로 이동
  goPopular() {
    this.navc.navigateForward(['/shop/popular']);
  }

  //추천상품 리스트로 이동
  gorecommend() {
    this.navc.navigateForward(['/shop/recommend']);
  }

  //기획전 리스트로 이동
  goeventList() {
    this.navc.navigateForward(['/shop/event-list']);
  }

  //상품 상세로 이동
  goItemDetail(item) {
    this.navc.navigateForward(['/shop/product-detail'], {
      queryParams: { id: item.id },
    });
  }

  //기획전 상세로 이동
  goeventDetail(item) {
    this.navc.navigateForward(['/shop/event-detail'], {
      queryParams: { id: item.id },
    });
  }
}
