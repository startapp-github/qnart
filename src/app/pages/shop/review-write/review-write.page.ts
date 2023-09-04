import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController } from '@ionic/angular';
import { MbscFormOptions } from '@mobiscroll/angular';
import { ImageService } from 'src/app/services/image.service';
import { Review } from 'src/app/models/review';
import { DbService } from 'src/app/services/db.service';
import { map, switchMap, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { combineLatest, of } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-review-write',
  templateUrl: './review-write.page.html',
  styleUrls: ['./review-write.page.scss'],
})
export class ReviewWritePage implements OnInit {
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
  reviews: Review = {
    id: '',
    grade: 0,
    content: '',
    images: [],
    dateCreated: new Date().toISOString(),
    userId: '',
    orderId: '',
    answer: '',
    deleteSwitch: false,
    answerSwitch: false,
    answerDate: '',
    cartId: '',
  };
  product;
  type;
  options = [];
  header: string;
  currentUser: any;
  reviewSwitch = false;
  reviewCheck;
  checkReviews: any;
  productId: string;

  constructor(
    public actionSheetController: ActionSheetController,
    private navc: NavController,
    private imageService: ImageService,
    private db: DbService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private commonService: CommonService,
    private alertService: AlertService
  ) {
    this.reviews.orderId = this.route.snapshot.queryParams.orderId;
    this.reviews.id = this.route.snapshot.queryParams.reviewId;
    this.type = this.route.snapshot.queryParams.type;
    this.reviews.cartId = this.route.snapshot.queryParams.cartId;
  }

  async ngOnInit() {
    this.product = await this.getProduct();

    this.currentUser = await this.auth.getUser();
    this.title();
    this.checkReview();
    if (this.type === 'edit') {
      this.reviews = await this.getProductReview();
    }
  }

  title() {
    if (this.type === 'edit') {
      this.header = '리뷰 수정';
    } else if (this.type === 'write') {
      this.header = '리뷰 작성';
    }
  }

  //해당 상품 가져오기
  getProduct() {
    return this.db
      .doc$(`cart/${this.reviews.cartId}`)
      .pipe(take(1))
      .toPromise();
  }

  //상품문의 가져오기(수정)
  getProductReview() {
    return this.db.doc$(`review/${this.reviews.id}`).pipe(take(1)).toPromise();
  }

  async checkReview() {
    //유저가 있을때
    if (this.currentUser) {
      this.reviewCheck = await this.db
        .collection$('cart', (ref) =>
          ref
            .orderBy('dateCreated', 'desc')
            .where('uid', '==', this.currentUser.uid)
            .where('productId', '==', this.product.productId)
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
                      console.log('item', item);

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
          map((orders) => {
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
        )
        .pipe(take(1))
        .toPromise();
    } else {
      //유저가 없을때는 무조건 false
      return false;
    }
  }

  //내용 글자 수 체크
  lengthCheck() {
    if (this.reviews.content) {
      if (this.reviews.content.length > 500) {
        this.reviews.content = this.reviews.content.substr(0, 500);
      } else {
        return false;
      }
    }
  }

  //카메라/갤러리
  async camera() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-actionSheet',
      buttons: [
        {
          text: '카메라',
          handler: () => {
            this.imageService.getCamera('reviews').then(async (url) => {
              const image = await this.imageService.uploadToStorage(
                url,
                'reviews'
              );
              this.reviews.images.push(image);
            });
          },
        },
        {
          text: '갤러리',
          handler: () => {
            this.imageService.getGallery('reviews').then(async (url) => {
              const image = await this.imageService.uploadToStorage(
                url,
                'reviews'
              );
              this.reviews.images.push(image);
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

  //완료
  async complete() {
    if (this.type === 'write') {
      this.alertService
        .cancelOkBtn(
          'alert head confirm my-alert',
          '리뷰를 작성하시겠습니까?',
          '작성 완료',
          '취소',
          '저장하기'
        )
        .then((res) => {
          if (res) {
            if (this.type === 'write') {
              this.update();
            } else if (this.type === 'edit') {
              this.edit();
            }
          }
        });
    } else if (this.type === 'edit') {
      this.completeEdit();
    }
  }

  //수정완료
  async completeEdit() {
    this.alertService
      .cancelOkBtn(
        'alert head confirm my-alert',
        '리뷰수정을 완료하시겠습니까?',
        '수정 완료',
        '취소',
        '저장하기'
      )
      .then((res) => {
        if (res) {
          if (this.type === 'write') {
            this.update();
          } else if (this.type === 'edit') {
            this.edit();
          }
        }
      });
  }

  //작성 업데이트
  update() {
    this.reviews.id = this.commonService.generateFilename();
    this.reviews.userId = this.currentUser.id;
    this.reviews.cartId = this.reviewCheck[0].id;
    //카트에 하나 리뷰스위치 true로 바꿔야함(오더 컬렉션 기준으로 최신순 오더에 리뷰스위치)
    this.db.updateAt(`cart/${this.reviewCheck[0].id}`, {
      reviewSwitch: true,
    });
    this.db.updateAt(`review/${this.reviews.id}`, this.reviews).then(() => {
      this.PostComplete();
      this.navc.pop();
    });
  }

  //수정 업데이트
  edit() {
    this.db
      .updateAt(`review/${this.reviews.id}`, {
        grade: this.reviews.grade,
        content: this.reviews.content,
        images: this.reviews.images,
        userId: this.currentUser.id,
      })
      .then(() => {
        this.PostComplete();
        this.navc.pop();
      });
  }

  //리뷰 작성 완료 토스트
  PostComplete() {
    this.alertService.toast('리뷰를 작성하셨습니다.', 'toast');
  }

  //리뷰 수정 완료 토스트
  EditComplete() {
    this.alertService.toast('리뷰를 수정했습니다.', 'toast');
  }

  //백버튼
  async cancel() {
    this.alertService
      .cancelOkBtn(
        'alert head confirm my-alert alert-exit',
        '작성하신 내용이 저장되지 않았습니다.\n 그래도 나가시겠습니까?',
        '나가기',
        '취소',
        '나가기'
      )
      .then((res) => {
        if (res) {
          this.navc.pop();
        }
      });
  }

  //이미지 삭제
  delete(index) {
    this.reviews.images.splice(index, 1);
  }
}
