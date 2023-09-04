import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DbService, leftJoinDocument } from 'src/app/services/db.service';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
// import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import * as _ from 'lodash';
import { AlertService } from 'src/app/services/alert.service';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user.models';

@Component({
  selector: 'app-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
})
export class ReviewPage implements OnInit {
  currentUser: User;
  buylist$: Observable<Array<any>> = of([]);
  reviewSwitch;
  inquires;
  type = '리뷰';

  constructor(
    private navc: NavController,
    private db: DbService,
    private auth: AuthService,
    private alertService: AlertService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.currentUser = await this.auth.getUser();
    this.getCanReviewList();
    this.inquires = await this.getInquiry();

    this.type = this.route.snapshot.queryParams.type
      ? this.route.snapshot.queryParams.type
      : '리뷰';
  }

  //review 쓸 수 있는 유저인지 확인
  getCanReviewList() {
    //유저가 있을때
    if (this.currentUser) {
      this.buylist$ = this.db
        .collection$(
          'cart',
          (
            ref // 카트 uid 가 유저아이디고 구매완료된 상품일 때
          ) =>
            ref
              .where('uid', '==', this.currentUser.uid)
              .where('orderDoneSwitch', '==', true)
        )
        .pipe(leftJoinDocument(this.db.afs, 'productId', 'product'))
        .pipe(
          switchMap((datas: any) => {
            if (datas && datas.length > 0) {
              let result = [];
              datas.forEach((data) => {
                //order 에서 카트 id가 있는 경우를 다시 가져옴
                const tmp$ = this.db
                  .collection$('order', (ref) =>
                    ref
                      .where('cartIds', 'array-contains', data.id)
                      .where('shipmentStatus', '==', '배송완료')
                      .orderBy('shipmentDate', 'desc')
                  )
                  .pipe(
                    map((item) => {
                      if (item && item.length > 0) {
                        const itemId = item[0].id;
                        delete item[0].id;

                        item[0]['orderId'] = itemId;

                        return { ...data, ...item[0] };
                      } else {
                        return '';
                      }
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
          map((datas) => {
            if (datas && datas.length > 0) {
              const setTotalResult = datas
                .filter((ele) => ele !== '')
                .sort((a: any, b: any) => {
                  return (
                    new Date(b.shipmentDate).getTime() -
                    new Date(a.shipmentDate).getTime()
                  );
                });

              return setTotalResult;
            } else {
              return [];
            }
          })
        );
    } else {
      //유저가 없을때는 무조건 false
      return false;
    }
  }

  //문의가져오기
  getInquiry() {
    return this.db
      .collection$('productInquiry', (ref) =>
        ref
          .orderBy('dateCreated', 'desc')
          .where('deleteSwitch', '==', false)
          .where('userId', '==', this.currentUser.uid)
      )
      .pipe(leftJoinDocument(this.db.afs, 'productId', 'product'))
      .pipe(take(1))
      .toPromise();
  }

  //리뷰 샹세
  goItem(item) {
    if (item.productId.deleteSwitch) {
      this.Deleteitem();
    } else {
      this.navc.navigateForward(['/shop/product-detail'], {
        queryParams: { id: item.productId.id },
      });
    }
  }

  //문의 상세
  goItem2(item) {
    if (item.productId.deleteSwitch) {
      this.Deleteitem2();
    } else {
      this.navc.navigateForward(['/shop/product-detail'], {
        queryParams: { id: item.productId.id },
      });
    }
  }

  /*
   * 상품이 없을 시
   */
  Deleteitem() {
    this.alertService.okBtn(
      'alert',
      '해당 상품의 판매가 중단되어\n 상세보기 및 리뷰작성이 불가능합니다.'
    );
  }

  Deleteitem2() {
    this.alertService.okBtn(
      'alert',
      '해당 상품의 판매가 중단되어\n 상세보기 및 문의작성이 불가능합니다.'
    );
  }

  //리뷰 상세보기
  async goReivew(item) {
    if (item.productId.deleteSwitch) {
      this.Deleteitem();
    } else {
      let review = await this.db
        .collection$(`review`, (ref) =>
          ref
            .where('userId', '==', this.currentUser.uid)
            .where('deleteSwitch', '==', false)
        )
        .pipe(
          map((datas) => {
            let find = datas.find((data) => item.id === data.cartId);
            return find;
          }),
          take(1)
        )
        .toPromise();

      this.navc.navigateForward(['/shop/product-detail'], {
        queryParams: {
          id: item.productId.id,
          review: review.id,
          focus: 'reviewFocus',
        },
      });
    }
  }

  //리뷰 작성하기
  async goReivewInquiry(item) {
    if (item.productId.deleteSwitch) {
      this.Deleteitem();
    } else {
      this.navc.navigateForward(['/shop/review-write'], {
        queryParams: { cartId: item.id, orderId: item.orderId, type: 'write' },
      });
    }
  }

  //리뷰 편집하기
  async goReivewInquiryEdit(item) {
    if (item.productId.deleteSwitch) {
      this.Deleteitem();
    } else {
      let review = await this.db
        .collection$(`review`, (ref) =>
          ref
            .where('userId', '==', this.currentUser.uid)
            .where('deleteSwitch', '==', false)
        )
        .pipe(
          map((datas) => {
            let find = datas.find((data) => item.id === data.cartId);
            return find;
          }),
          take(1)
        )
        .toPromise();
      this.navc.navigateForward(['/shop/review-write'], {
        queryParams: {
          reviewId: review.id,
          cartId: item.id,
          orderId: item.orderId,
          type: 'edit',
        },
      });
    }
  }

  //리뷰 삭제
  async DeleteReview(item) {
    //해당 리뷰리스트 가져오기 (deleteSwtich 변경)
    let review = await this.db
      .collection$(`review`, (ref) =>
        ref.where('userId', '==', this.currentUser.uid)
      )
      .pipe(
        map((datas) => {
          let find = datas.find((data) => item.cartIds.includes(data.cartId));
          return find;
        }),
        take(1)
      )
      .toPromise();

    //해당 카트리스트 가져오기 (reviewSwitch 변경)
    let cart = await this.db
      .collection$(`cart`, (ref) =>
        ref.where('uid', '==', this.currentUser.uid)
      )
      .pipe(
        map((datas) => {
          let find = datas.find((ele) => ele.id.includes(review.cartId));
          return find;
        }),
        take(1)
      )
      .toPromise();

    this.alertService
      .cancelOkBtn(
        'alert confirm',
        '리뷰를 삭제하시겠습니까?\n 삭제한 리뷰는 복구할 수 없으며\n 추후 작성이 불가능합니다.',
        '',
        '취소',
        '삭제하기'
      )
      .then((res) => {
        if (res) {
          this.db.updateAt(`cart/${cart.id}`, {
            reviewSwitch: false,
          });
          this.db.updateAt(`review/${review.id}`, {
            deleteSwitch: true,
          });
          this.DeleteReviewMessage();
        }
      });
  }

  DeleteReviewMessage() {
    this.alertService.toast('리뷰를 삭제했습니다.', 'toast');
  }

  //문의 상세
  goInquiry(item) {
    if (item.productId.deleteSwitch) {
      this.Deleteitem2();
    } else {
      this.navc.navigateForward(['/shop/product-detail'], {
        queryParams: {
          id: item.productId.id,
          review: item.id,
          focus: 'inquiryFocus',
        },
      });
    }
  }

  //문의 편집하기
  goEditInquiry(item, type) {
    if (item.productId.deleteSwitch) {
      this.Deleteitem2();
    } else {
      this.navc.navigateForward(['/shop/product-inquiry'], {
        queryParams: { productId: item.productId.id, id: item.id, type: type },
      });
    }
  }

  //문의 삭제
  async DeleteInquiry(item) {
    this.alertService
      .cancelOkBtn(
        'alert confirm',
        '상품문의를 삭제하시겠습니까?\n 삭제한 상품문의는 되돌릴 수 없습니다.',
        '',
        '취소',
        '삭제하기'
      )
      .then(async (res) => {
        if (res) {
          this.db.updateAt(`productInquiry/${item.id}`, {
            deleteSwitch: true,
          });
          this.inquires = await this.getInquiry();
          this.DeleteInquiryMessage();
        }
      });
  }

  DeleteInquiryMessage() {
    this.alertService.toast('상품문의를 삭제했습니다.', 'toast');
  }
}
