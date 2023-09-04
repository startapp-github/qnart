import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { Cart } from 'src/app/models/cart';

import { AlertService } from 'src/app/services/alert.service';
import { DbService } from 'src/app/services/db.service';
import { docJoin } from 'src/app/services/firebase.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-refund-product',
  templateUrl: './refund-product.page.html',
  styleUrls: ['./refund-product.page.scss'],
})
export class RefundProductPage implements OnInit {
  id: string;
  method: string;
  cart: Cart;
  allChecked: boolean = false;
  constructor(
    private navc: NavController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private db: DbService,
    public alertService: AlertService,
    public loadingService: LoadingService
  ) {
    this.id = this.route.snapshot.queryParams.id;
    this.method = this.route.snapshot.queryParams.method;
  }

  async ngOnInit() {
    this.loadingService.load();
    this.cart = await this.getOrder();
    if (this.method == 'change') {
      const options = this.cart.options;
      this.cart['changeOptions'] = options;
      this.cart.options = [];
    }

    this.loadingService.hide();
  }

  // <상품 선택> 주문한 상품 가져오기
  getOrder(): Promise<any> {
    return this.db
      .doc$(`cart/${this.id}`)
      .pipe(docJoin(this.db.afs, 'productId', 'product'))
      .pipe(take(1))
      .toPromise();
  }

  select: any = {
    cssClass: 'select-box',
  };

  gomethod() {
    this.navc.navigateBack(['/shop/refund-method']);
  }

  //사유 작성으로 이동
  goreason() {
    if (this.method == 'change') {
      let newCart = {
        id: this.cart.id,
        options: this.cart.options,
        changeOptions: this.cart.changeOptions,
        productStatus: '교환',
      };

      localStorage.setItem('newCart', JSON.stringify(newCart));

      this.navc.navigateForward(['/shop/refund-reason'], {
        queryParams: {
          id: this.id,
          method: this.method,
        },
      });
    } else {
      this.navc.navigateForward(['/shop/refund-reason'], {
        queryParams: {
          id: this.id,
          method: this.method,
        },
      });
    }
  }

  back() {
    this.alertService
      .cancelOkBtn(
        'alert confirm header',
        '입력하신 내용이 저장되지 않습니다.<br>그래도 나가시겠습니까?',
        '나가기',
        '취소',
        '나가기'
      )
      .then((ok) => {
        if (ok) {
          this.navc.navigateRoot('/shop/order-list', {
            animated: true,
            animationDirection: 'back',
          });
        }
      });
  }

  checkDisabeld(e) {
    if (e) {
      this.alertService.okBtn('alert', '이미 교환/환불 진행중인 상품입니다.');
    }
  }

  //상품 교환일 경우 교환할 옵션 선택
  checkCartOption() {
    const result = this.cart.options.filter((ele) => ele.value);
    return result && result.length > 0 ? result.length : 0;
  }
}
