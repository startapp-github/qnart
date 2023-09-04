import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { user } from 'src/app/classes/user';
import { Order } from 'src/app/models/order';
import { AuthService } from 'src/app/services/auth.service';
import { ArrayJoin, DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-pay-complete',
  templateUrl: './pay-complete.page.html',
  styleUrls: ['./pay-complete.page.scss'],
})
export class PayCompletePage implements OnInit {
  user: user | any;
  deliveryCharge: number = 2500; //일단 고정 값
  id: string = '';
  order: Order;
  constructor(
    public modalController: ModalController,
    private navc: NavController,
    private auth: AuthService,
    private route: ActivatedRoute,
    private db: DbService
  ) {
    this.id = route.snapshot.queryParams.id;
  }

  async ngOnInit() {
    this.user = await this.auth.getUser();
    this.order = await this.getOrder();
  }

  // 주문한 데이터 가져오기
  getOrder(): Promise<Order | any> {
    return this.db
      .doc$(`order/${this.id}`)
      .pipe(ArrayJoin(this.db.afs, 'cartIds', 'cart'))
      .pipe(take(1))
      .toPromise();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  //주문 목록으로 이동
  goOrderList() {
    this.navc
      .navigateForward(['/shop/order-list'], {
        replaceUrl: true,
      })
      .then(() => {
        this.modalController.dismiss();
      });
  }

  //홈으로 이동
  goHome() {
    this.navc.navigateRoot('/tabs/mall').then(() => {
      this.modalController.dismiss();
    });
  }

  //최종 결제 금액 계산
  totalPrice() {
    let result = 0;
    this.order.cartIds.map((item: any) => {
      const price = item.productInfo.discountPrice
        ? item.productInfo.discountPrice
        : item.productInfo.price;
      result += item.count * Number(price);
      return item;
    });

    return result;
  }
}
