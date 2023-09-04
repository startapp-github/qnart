import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonContent,
  ModalController,
  NavController,
  ActionSheetController,
} from '@ionic/angular';
import { ProductDetailPopupPage } from '../product-detail-popup/product-detail-popup.page';
import { MbscFormOptions } from '@mobiscroll/angular';
// import { ImageDetailPage } from '../image-detail/image-detail.page';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import {
  categoryDocJoin,
  DbService,
  leftJoinDocument,
} from 'src/app/services/db.service';
import { map, switchMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { Cart } from 'src/app/models/cart';
import { review } from 'src/app/classes/review';
import { User } from 'src/app/models/user.models';
import { LoadingService } from 'src/app/services/loading.service';
import * as firebase from 'firebase/compat/app';
import { inAnimation } from 'src/app/animate/ngifAnimate';
import { ImageModalPage } from '../../image-modal/image-modal.page';
import { InquiryWritePage } from '../../inquiry-write/inquiry-write.page';
import { ProductInquiryPage } from '../product-inquiry/product-inquiry.page';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  animations: [inAnimation],
})
export class ProductDetailPage implements OnInit {
  @ViewChild('content') content: IonContent;

  rating: number;
  custom = 3;
  steps = 1.5;
  value = 4;
  disabled: number;

  primary: number;
  secondary: number;
  success: number;
  danger: number;
  warning: number;
  info: number;

  formSettings: MbscFormOptions = {
    theme: 'ios',
    themeVariant: 'light',
  };

  topSeg = '정보';
  heart: boolean;

  productId = '';
  inquiryId = '';
  reviewId = '';
  product$: Observable<any>;
  product: any;
  currentUser: any;
  productInquires: any;
  reviews: any;
  heartList;
  reviewSwitch = false;
  reviewCheck$: Observable<Array<Cart>> = of([]);
  average: any;
  option: Array<any>;
  focus: string;
  isExpanded = true;
  user$: Observable<User>;
  userNickname: any;
  inquiryList;

  constructor(
    public modalCtrl: ModalController,
    public actionSheetController: ActionSheetController,
    private navc: NavController,
    private route: ActivatedRoute,
    private db: DbService,
    private auth: AuthService,
    public alertService: AlertService,
    private loader: LoadingService
  ) {
    this.productId = this.route.snapshot.queryParams.id;
    this.reviewId = this.route.snapshot.queryParams.review;
    this.focus = this.route.snapshot.queryParams.focus;
  }

  ngOnInit() {
    this.user$ = this.auth.user$;
  }

  async ionViewWillEnter() {
    this.loader.load();
    //세그먼트 이동
    if (this.focus === 'inquiryFocus') {
      this.topSeg = '문의';
    } else if (this.focus === 'reviewFocus') {
      this.topSeg = '리뷰';
    }
    this.currentUser = await this.auth.getUser();

    //상품
    this.getProduct();
    this.productInquires = await this.getProductInquiry();

    this.reviews = await this.getReview();

    //상품 리뷰/문의에서 상세보기 눌렀을 경우 해당 리뷰/문의 포커스
    if (this.reviewId) {
      setTimeout(() => {
        const review = document.getElementById(this.reviewId);
        review.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 150);
    }
    this.option = this.reviews.map((ele) => ele.options);
    this.getAverage();
    this.loader.hide();
  }

  //리뷰 평점
  getReviewRate(reviews: Array<review>) {
    let allRate = 0;
    reviews.forEach((review) => {
      allRate += review.rate;
    });
    return (allRate / reviews.length).toFixed(1);
  }

  //평점
  getAverage() {
    const allGrade = this.reviews.map((ele) => ele.grade);
    if (allGrade.length) {
      this.average = (
        allGrade.reduce((a, c) => a + c) / allGrade.length
      ).toFixed(1);
    } else {
      this.average = '0';
    }
  }

  //상품가져오기
  async getProduct() {
    const uid = this.currentUser ? this.currentUser.uid : '';
    this.product$ = this.db
      .doc$(`product/${this.productId}`)
      .pipe(categoryDocJoin(this.db.afs))
      .pipe(
        map((data: any) => {
          if (data.heartList.includes(uid)) {
            data['heart'] = true;
          } else {
            data['heart'] = false;
          }
          this.product = data;
          return data;
        })
      );

    this.checkReview();
  }

  //리뷰 불러오기
  async getReview() {
    return this.db
      .collection$('review', (ref) =>
        ref.orderBy('dateCreated', 'desc').where('deleteSwitch', '==', false)
      )
      .pipe(leftJoinDocument(this.db.afs, 'userId', 'users'))
      .pipe(leftJoinDocument(this.db.afs, 'cartId', 'cart'))
      .pipe(
        map((reviews: any) => {
          return reviews.filter((ele) =>
            ele.cartId.productId.includes(this.productId)
          );
        })
      )
      .pipe(
        map((val: any) => {
          val.forEach((element) => {
            if (element.userId.name) {
              const setName = element.userId.name.replace(/.$/, '*');

              element.userId.name = setName;
            }
          });

          return val;
        })
      )
      .pipe(take(1))
      .toPromise();
  }

  //review 쓸 수 있는 유저인지 확인
  checkReview() {
    //유저가 있을때
    if (this.currentUser) {
      this.reviewCheck$ = this.db
        .collection$('cart', (ref) =>
          ref
            .where('uid', '==', this.currentUser.uid)
            .where('productId', '==', this.productId)
            .where('orderDoneSwitch', '==', true)
            .where('reviewSwitch', '==', false)
        ) // 카트 uid 가 유저아니디고 프로덕트 아이디가 같고 리뷰를 쓰지 않은 경우
        .pipe(
          switchMap((datas) => {
            //그런 경우가 있을때
            if (datas && datas.length > 0) {
              let result = [];
              datas.forEach((data) => {
                //order 에서 카트 id가 있는 경우를 다시 가져옴
                const tmp$ = this.db
                  .collection$('order', (ref) =>
                    ref.where('cartIds', 'array-contains', data.id)
                  )
                  .pipe(
                    map((item) => {
                      return { ...data, order: item[0] };
                    })
                  );

                result.push(tmp$);
              });

              return combineLatest(result);
            } else {
              //없을땐 빈값 리턴
              return of([]);
            }
          })
        )
        .pipe(
          map((orders: any) => {
            let tmp;
            //다시 한번 cart정보와 order 정보를 합쳐놓은 정보를 가져와서
            if (orders && orders.length > 0) {
              //배송된 정보만 걸러서
              tmp = orders.filter(
                (ele) => ele.order?.shipmentStatus == '배송완료'
              );

              if (tmp && tmp.length > 0) {
                //배송완료된 정보가 있을땐 트루
                this.reviewSwitch = true;
              } else {
                //없으면 펄스
                this.reviewSwitch = false;
              }
            } else {
              //빈값일땐 reviewSwitch false
              this.reviewSwitch = false;
            }

            return tmp;
          })
        );
    } else {
      //유저가 없을때는 무조건 false
      return false;
    }
  }

  //내가 쓴 문의 가져오기
  async getProductInquiry() {
    return this.db
      .collection$('productInquiry', (ref) =>
        ref
          .orderBy('dateCreated', 'desc')
          .where('productId', '==', this.productId)
          .where('deleteSwitch', '==', false)
      )
      .pipe(leftJoinDocument(this.db.afs, 'userId', 'users'))
      .pipe(
        map((val: any) => {
          console.log({ val });

          val.forEach((element) => {
            if (element.userId.name) {
              const setName = element.userId.name.replace(/.$/, '*');

              element.userId.name = setName;
            }
          });

          return val;
        })
      )
      .pipe(take(1))
      .toPromise();
  }

  onScroll($event) {
    let scrollTop = $event.detail.scrollTop;
    if (scrollTop <= 150) {
      document.getElementById('scroll2').classList.remove('active');
    } else {
      document.getElementById('scroll2').classList.add('active');
    }
  }

  //좋아요
  async like(item) {
    if (this.currentUser) {
      if (item.heart) {
        this.DeletePick(item);
      } else {
        this.db
          .updateAt(`product/${item.id}`, {
            heartList: firebase.default.firestore.FieldValue.arrayUnion(
              this.currentUser.uid
            ),
          })
          .then(() => {
            item.heart = true;
            item.heartList.push(this.currentUser.uid);
            this.Pick();
          });
      }
    } else {
      this.alertService.noneUser();
    }
  }
  top() {
    setTimeout(() => {
      this.content.scrollToPoint(0, 0, 500);
    }, 200);
  }

  //구매하기 모달창
  async Buyopen(product) {
    if (this.currentUser) {
      const modal = await this.modalCtrl.create({
        component: ProductDetailPopupPage,
        cssClass: 'buy-popup',
        componentProps: {
          product,
        },
      });
      return await modal.present();
    } else {
      this.alertService.noneUser();
    }
  }

  //찜 추가
  Pick() {
    this.alertService.toast('찜한상품 목록에 추가했습니다.', 'toast');
  }

  //찜 삭제
  async DeletePick(item) {
    this.alertService
      .cancelOkBtn('alert confirm', '찜한상품 목록에서 삭제하시겠습니까?')
      .then((ok) => {
        if (ok) {
          this.db
            .updateAt(`product/${item.id}`, {
              heartList: firebase.default.firestore.FieldValue.arrayRemove(
                this.currentUser.uid
              ),
            })
            .then(() => {
              this.dePickToast();
              item.heart = false;
              item.heartList.pop();
            });
        }
      });
  }

  //찜 삭제 완료 토스트
  dePickToast() {
    this.alertService.toast('찜한상품 목록에서 삭제했습니다.', 'toast');
  }

  //리뷰 수정/삭제
  async editReview(i, item?) {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-actionSheet',
      buttons: [
        {
          text: '수정',
          handler: () => {
            this.navc.navigateForward(['/shop/review-write'], {
              queryParams: {
                reviewId: item.id,
                cartId: item.cartId.id,
                orderId: item.orderId,
                type: 'edit',
              },
            });
          },
        },
        {
          text: '삭제',
          handler: () => {
            this.alertService
              .cancelOkBtn(
                'alert confirm',
                '리뷰를 삭제하시겠습니까?\n 삭제한 리뷰는 되돌릴 수 없습니다.',
                '',
                '취소',
                '삭제하기'
              )
              .then((res) => {
                if (res) {
                  this.db.updateAt(`review/${item.id}`, {
                    deleteSwitch: true,
                  });
                  this.db
                    .updateAt(`cart/${item.cartId.id}`, {
                      reviewSwitch: false,
                    })
                    .then(() => {
                      this.reviews.splice(i, 1);
                      this.getAverage();
                    });

                  this.DeleteReviewSuccess();
                }
              });
          },
        },

        {
          cssClass: 'my-actionSheet-cancel',

          text: '취소',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    await actionSheet.present();
  }

  //문의 수정/삭제
  async editInquiry(i, item?) {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-actionSheet',
      buttons: [
        {
          text: '수정',
          handler: () => {
            this.navc.navigateForward(['/shop/product-inquiry'], {
              queryParams: {
                id: item.id,
                productId: item.productId,
                type: 'edit',
              },
            });
          },
        },
        {
          text: '삭제',
          handler: () => {
            this.alertService
              .cancelOkBtn(
                'alert confirm',
                '문의를 삭제하시겠습니까?\n 삭제한 문의는 되돌릴 수 없습니다.',
                '',
                '취소',
                '삭제하기'
              )
              .then((res) => {
                if (res) {
                  this.db.updateAt(`productInquiry/${item.id}`, {
                    deleteSwitch: true,
                  });
                  this.DeleteInquirySuccess();
                  this.productInquires.splice(i, 1);
                }
              });
          },
        },

        {
          cssClass: 'my-actionSheet-cancel',

          text: '취소',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    await actionSheet.present();
  }

  // 상품 문의
  goInquiry() {
    this.navc.navigateForward(['/shop/product-inquiry'], {
      queryParams: { productId: this.productId, type: 'write' },
    });
  }

  // 검색
  gosearch() {
    this.navc.navigateForward(['/shop/search']);
  }

  // 장바구니
  gobasket() {
    this.navc.navigateForward(['/shop/basket']);
  }

  // 리뷰
  goReviewWrite(productId) {
    this.navc.navigateForward(['/shop/review-write'], {
      queryParams: { productId: productId, type: 'write' },
    });
  }

  // 리뷰 삭제 완료 토스트
  DeleteReviewSuccess() {
    this.alertService.toast('리뷰를 삭제했습니다.', 'toast');
  }

  // 문의 삭제 완료 토스트
  DeleteInquirySuccess() {
    this.alertService.toast('문의를 삭제했습니다.', 'toast');
  }

  async imagesMoreModal(images, index) {
    const modal = await this.modalCtrl.create({
      component: ImageModalPage,
      componentProps: { images, index },
    });

    await modal.present();
  }
}
