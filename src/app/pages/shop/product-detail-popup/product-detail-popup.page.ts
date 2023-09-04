import { Component, Input, OnInit } from '@angular/core';
import {
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { take } from 'rxjs/operators';
import { Cart } from 'src/app/models/cart';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-product-detail-popup',
  templateUrl: './product-detail-popup.page.html',
  styleUrls: ['./product-detail-popup.page.scss'],
})
export class ProductDetailPopupPage implements OnInit {
  @Input() product;
  cart: Cart = {
    id: this.db.afs.createId(),
    dateCreated: '',
    uid: localStorage.getItem('userId'),
    productId: '',
    count: 1,
    orderDoneSwitch: false,
    options: [],
    productInfo: {
      productName: '',
      price: 0,
      discountPrice: 0,
      discountRate: 0,
      infoText: '',
      images: [],
    },
    doneSwitch: false,
    reviewSwitch: false,
    deleteSwitch: false,
  };
  count: number = 0;

  constructor(
    public modalController: ModalController,
    public toastController: ToastController,
    private navc: NavController,
    private db: DbService,
    public alertService: AlertService,
    private auth: AuthService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    console.log('this.product', this.product);

    this.cart.productId = this.product.id;
    this.cart.productInfo.productName = this.product.productName;
    this.cart.productInfo.price = this.product.price;
    this.cart.productInfo.discountPrice = this.product.discountPrice;
    this.cart.productInfo.discountRate = this.product.discountRate;
    this.cart.productInfo.infoText = this.product.infoText;
    this.cart.productInfo.images = this.product.images;
  }

  //상품 수량 + / -
  countUpdate(type) {
    if (type == 'plus') {
      this.cart.count = this.cart.count + 1;
    } else {
      this.cart.count = this.cart.count - 1;
    }
  }

  //모달 닫기
  dismiss() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }

  select: any = {
    cssClass: 'select-box',
  };

  //상품 선택 후 장바구니에 담기
  async basket() {
    this.loadingService.load();

    const product = await this.db
      .doc$(`product/${this.product.id}`)
      .pipe(take(1))
      .toPromise();
    const user = await this.auth.getUser();

    //품절된 상품이면
    if (product.stockCount <= 0) {
      this.alertService.okBtn('', '품절된 상품입니다.').then(() => {
        this.modalController.dismiss();
      });
      this.loadingService.hide();
      return false;
    }

    //옵션 선택 안 하면
    if (
      this.product?.options?.length !== this.cart?.options?.length ||
      !this.cart.count ||
      this.cart.count == 0
    ) {
      this.alertService.okBtn('', '옵션을 모두 선택해주세요.');
      this.loadingService.hide();
      return false;
    }
    this.cart.dateCreated = new Date().toISOString();

    this.db.updateAt(`cart/${this.cart.id}`, this.cart).then(async () => {
      this.db.updateAt(`users/${user.uid}`, {
        cartCount: firebase.default.firestore.FieldValue.increment(1),
      });
      this.loadingService.hide();
      this.modalController.dismiss();
      const toast = await this.toastController.create({
        header: '장바구니에 상품을 담았습니다.',
        cssClass: 'toast',
        duration: 2000,
        buttons: [
          {
            text: '장바구니 바로가기',
            handler: () => {
              this.navc.navigateForward(['/shop/basket']);
            },
          },
        ],
      });
      await toast.present();
    });
  }

  setCartData() {
    this.cart = {
      id: '',
      dateCreated: '',
      uid: '',
      productId: '',
      count: 1,
      orderDoneSwitch: false,
      options: [],
      productInfo: {
        productName: '',
        price: 0,
        discountPrice: 0,
        discountRate: 0,
        infoText: '',
        images: [],
      },
      doneSwitch: false,
      reviewSwitch: false,
      deleteSwitch: false,
    };
  }

  //[구매하기]
  async goOrder() {
    const product = await this.db
      .doc$(`product/${this.product.id}`)
      .pipe(take(1))
      .toPromise();
    const user = await this.auth.getUser();

    //배송지 없을때
    if (
      !user.addressDetail ||
      !user.recipient ||
      !user.deliveryPhone ||
      !user.address
    ) {
      this.alertService
        .cancelOkBtn(
          'alert confirm',
          '배송 정보가 입력되지 않았습니다. 배송주소 입력페이지로 이동합니다.'
        )
        .then((ok) => {
          if (ok) {
            this.modalController.dismiss();
            this.navc.navigateForward(['/shop/myinfo-address']);
          }
        });

      return false;
    }
    //품절된 상품이면
    if (product.stockCount <= 0) {
      this.alertService.okBtn('', '품절된 상품입니다.').then(() => {
        this.modalController.dismiss();
      });
      this.loadingService.hide();
      return false;
    }

    //옵션 선택 안 하면
    if (
      this.product?.options?.length !== this.checkCartOption() ||
      !this.cart.count ||
      this.cart.count == 0
    ) {
      this.alertService.okBtn('', '옵션을 모두 선택해주세요.');
      this.loadingService.hide();
      return false;
    }

    this.cart.dateCreated = new Date().toISOString();

    localStorage.setItem('detailCart', JSON.stringify(this.cart));

    this.modalController.dismiss();
    this.navc.navigateForward(['/shop/order'], {
      queryParams: { page: 'detail' },
    });
  }

  // [X] 선택한 상품 삭제
  deleteSet() {
    this.cart.count = 1;
    this.cart.options = [];
  }

  //총 가격
  checkMileage() {
    let result = 0;
    const price = this.product.discountPrice
      ? this.product.discountPrice
      : this.product.price;
    result = this.cart.count * Number(price);

    return result;
  }

  //옵션 다 선택된건지 확인
  checkCartOption() {
    const result = this.cart.options.filter((ele) => ele.value);
    return result && result.length > 0 ? result.length : 0;
  }
}
