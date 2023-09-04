import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { Order } from 'src/app/models/order';
import { ArrayJoin, DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-order-cancel',
  templateUrl: './order-cancel.page.html',
  styleUrls: ['./order-cancel.page.scss'],
})
export class OrderCancelPage implements OnInit {
  @Input() id;
  order: Order;
  deliveryCharge: number = 2500; //일단 고정 값

  constructor(
    public modalController: ModalController,
    private navc: NavController,
    private db: DbService
  ) {}

  async ngOnInit() {
    this.order = await this.getOrder();
  }

  //주문 데이터 가져오기
  getOrder(): Promise<Order | any> {
    return this.db
      .doc$(`order/${this.id}`)
      .pipe(ArrayJoin(this.db.afs, 'cartIds', 'cart'))
      .pipe(take(1))
      .toPromise();
  }

  //모달 닫기
  dismiss() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }

  //[신청내역 확인하기]
  goCheck() {
    this.navc
      .navigateForward(['/shop/refund-detail'], {
        queryParams: {
          id: this.id,
        },
      })
      .then(() => {
        this.dismiss();
      });
  }

  //[쇼핑 계속하기]홈으로 이동
  goHome() {
    this.navc.navigateForward(['/tabs/mall']).then(() => {
      this.dismiss();
    });
  }
}
