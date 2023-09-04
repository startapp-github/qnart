/** @format */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { combineLatest, Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Cart } from 'src/app/models/cart';
import { Order } from 'src/app/models/order';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { DbService, leftJoinDocument } from 'src/app/services/db.service';
import { IamportService } from 'src/app/services/iamport.service';
import { LoadingService } from 'src/app/services/loading.service';
import { PayCompletePage } from '../pay-complete/pay-complete.page';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {
  address = true;
  cartIds: Array<string> = [];
  carts$: Observable<Array<Cart> | any> = of([]);
  carts: Array<Cart> = [];
  user: any;
  deliveryCharge: number = 2500; //일단 고정 값
  order: Order = {
    id: this.commonService.payId(),
    dateCreated: '',
    uid: localStorage.getItem('userId'),
    shipmentStatus: '배송준비중',
    shipmentDate: '',
    cartIds: [],
    depositStatus: true,
    totalPrice: 0,
    deleteSwitch: false,
    address: '',
    addressDetail: '',
    deliveryPhone: '',
    recipient: '',
    adminDeleteSwitch: false,
  };
  beforePage: string = '';
  payMethod: any = null;
  constructor(
    private navc: NavController,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private db: DbService,
    private auth: AuthService,
    private alertService: AlertService,
    private commonService: CommonService,
    private iamport: IamportService,
    public loadingService: LoadingService
  ) {}

  async ngOnInit() {
    this.beforePage = this.route.snapshot.queryParams.page;
    console.log('this.beforePage', this.beforePage);

    if (this.beforePage == 'basket') {
      this.cartIds = this.route.snapshot.queryParams.cartIds;
      this.getCart();
    } else {
      const localCart = JSON.parse(localStorage.getItem('detailCart'));
      this.carts$ = of([localCart])
        .pipe(leftJoinDocument(this.db.afs, 'productId', 'product'))
        .pipe(
          map((data: any) => {
            const tmp = [].concat(...data);
            this.carts = tmp;
            return tmp;
          })
        );
    }
  }

  async ionViewWillEnter() {
    this.user = await this.auth.getUser();
  }

  ionViewWillLeave() {
    if (this.beforePage == 'detail') {
      localStorage.removeItem('detailCart');
    }
  }

  //장바구니를 통해 들어왔을 때 카트에 담긴 정보 가져오기
  getCart(): any {
    const ids = this.cartIds;

    if (!ids || !ids.length) return [];

    const batches = [];

    while (ids.length) {
      const batch = ids.splice(0, 10);

      // add the batch request to to a queue
      batches.push(
        this.db
          .collection$('cart', (ref) => ref.where('id', 'in', [...batch]))
          .pipe(leftJoinDocument(this.db.afs, 'productId', 'product'))
      );
    }

    this.carts$ = combineLatest(batches).pipe(
      map((data) => {
        const tmp = [].concat(...data);
        this.carts = tmp;
        return tmp;
      })
    );
  }

  //결제 완료 모달
  async goPay(id) {
    this.loadingService.hide();
    const modal = await this.modalController.create({
      component: PayCompletePage,
      cssClass: 'my-custom-class',
      componentProps: {
        id,
      },
    });
    return await modal.present();
  }

  //주소 등록 이동
  goEditAddress() {
    this.navc.navigateForward(['/shop/myinfo-address']);
  }

  //총 결제 금액
  totalPrice() {
    let result = 0;
    this.carts.map((item) => {
      const price = item.productInfo.discountPrice
        ? item.productInfo.discountPrice
        : item.productInfo.price;
      result += item.count * Number(price);
      return item;
    });

    return result;
  }

  //재고 확인하기
  checkSoldOut() {
    if (!this.payMethod) {
      this.alertService.okBtn('alert', '결제 방법을 선택해주세요.');
      return false;
    }

    //솔드 아웃 리스트
    const soldOutList = this.carts.filter(
      (ele: any) => ele.count > ele.productId.stockCount
    );

    if (soldOutList && soldOutList.length > 0) {
      this.alertService.okBtn('alert', '품절된 상품이 있습니다.').then((ok) => {
        if (ok) {
          this.navc.pop();
        }
      });
    } else {
      this.setOrder();
    }
  }

  //주문 데이터 업뎃
  async setOrder() {
    await this.loadingService.load();
    const ids = this.carts.map((ele) => ele.id);
    this.order.dateCreated = new Date().toISOString();
    this.order.cartIds = ids;
    this.order.totalPrice = this.totalPrice() + this.deliveryCharge;
    this.order.address = this.user.address;
    this.order.addressDetail = this.user.addressDetail;
    this.order.deliveryPhone = this.user.deliveryPhone;
    this.order.recipient = this.user.recipient;
    this.order.depositDate = new Date().toISOString();

    ///iamport
    const userPhone = this.user.phone ? this.user.phone : '';
    const data: any = await this.iamport
      .payment(
        String(this.order.totalPrice),
        this.payMethod,
        this.user.nickName,
        userPhone
      )
      .catch((err) => {
        console.log({ err });
        this.loadingService.hide();
      });

    if (!data) {
      return false;
    }

    await this.loadingService.load();

    if (this.payMethod == 'vbank') {
      this.order.depositStatus = false;
    }

    if (this.beforePage == 'basket') {
      this.setCartOrder();
    } else {
      this.order.payment = {
        imp_uid: data.imp_uid,
        merchant_uid: data.merchant_uid,
        payMethod: this.payMethod,
      };

      const promise = this.carts.map(async (ele: any) => {
        const productId = ele.productId.id;
        ele.orderDoneSwitch = true;
        delete ele.productId;
        ele.productId = productId;

        await this.db.updateAt(`product/${productId}`, {
          salesCount: firebase.default.firestore.FieldValue.increment(
            ele.count
          ),
          stockCount: firebase.default.firestore.FieldValue.increment(
            -ele.count
          ),
        });
        return this.db.updateAt(`cart/${ele.id}`, ele);
      });
      await Promise.all(promise);
      this.db.updateAt(`order/${this.order.id}`, this.order).then(() => {
        this.goPay(this.order.id);
        if (this.beforePage == 'detail') {
          localStorage.removeItem('detailCart');
        }
      });
    }
  }

  //장바구니에서 이어진 주문일 경우
  setCartOrder() {
    const uid = localStorage.getItem('userId');
    const cartLength =
      this.carts && this.carts.length > 0 ? this.carts.length : 0;
    this.db
      .updateAt(`users/${uid}`, {
        cartCount: firebase.default.firestore.FieldValue.increment(-cartLength),
      })
      .then(async () => {
        const promise = this.carts.map(async (ele: any) => {
          await this.db.updateAt(`product/${ele.productId.id}`, {
            salesCount: firebase.default.firestore.FieldValue.increment(
              ele.count
            ),
            stockCount: firebase.default.firestore.FieldValue.increment(
              -ele.count
            ),
          });

          return this.db.updateAt(`cart/${ele.id}`, {
            orderDoneSwitch: true,
          });
        });
        await Promise.all(promise);
        this.db.updateAt(`order/${this.order.id}`, this.order).then(() => {
          this.goPay(this.order.id);
        });
      });
  }

  // 3. 결제버튼에 대해 클릭 이벤트 핸들러 정의
  onClickPayment() {
    //   console.log('?dkdkdk');
    //   var userCode = 'iamport'; // 가맹점 식별코드
    //   var data = {
    //     pg: 'html5_inicis', // PG사
    //     pay_method: 'card', // 결제수단
    //     name: '아임포트 코르도바 테스트', // 주문명
    //     merchant_uid: 'mid_' + new Date().getTime(), // 주문번호
    //     amount: '1000', // 결제금액
    //     buyer_name: '홍길동', // 구매자 이름
    //     buyer_tel: '01012341234', // 구매자 연락처
    //     buyer_email: 'example@example.com', // 구매자 이메일
    //     app_scheme: 'example', // 앱 URL 스킴
    //   };
    //   var titleOptions = {
    //     text: '아임포트 코르도바 테스트', // 타이틀
    //     textColor: '#ffffff', // 타이틀 색
    //     textSize: '20', // 타이틀 크기
    //     textAlignment: 'left', // 타이틀 정렬 유형
    //     backgroundColor: '#344e81', // 타이틀 배경색
    //     show: true, // 타이틀 유무
    //     leftButtonType: 'back', // 왼쪽 버튼 유형
    //     leftButtonColor: '#ffffff', // 왼쪽 버튼 색
    //     rightButtonType: 'close', // 오른쪽 버튼 유형
    //     rightButtonColor: '#ffffff', // 오른쪽 버튼 색
    //   };
    //   // 4. 아임포트 코르도바 파라미터 정의
    //   var params = {
    //     userCode: userCode, // 4-1. 가맹점 식별코드 정의
    //     data: data, // 4-2. 결제 데이터 정의
    //     titleOptions: titleOptions, // 4-3. 결제창 헤더 옵션 정의
    //     callback: function (response) {
    //       // 4-3. 콜백 함수 정의
    //       alert(JSON.stringify(response));
    //     },
    //   };
    //   // 5. 결제창 호출
    //   IamportCordova.payment(params);
  }
}
