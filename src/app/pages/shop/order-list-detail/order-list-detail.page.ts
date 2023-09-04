import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { map, take } from 'rxjs/operators';
import { Order } from 'src/app/models/order';
import { User } from 'src/app/models/user.models';
import { AlertService } from 'src/app/services/alert.service';
import { ChatService } from 'src/app/services/chat.service';
import { ArrayJoin, DbService } from 'src/app/services/db.service';
import { TrackingModalPage } from '../tracking-modal/tracking-modal.page';

@Component({
  selector: 'app-order-list-detail',
  templateUrl: './order-list-detail.page.html',
  styleUrls: ['./order-list-detail.page.scss'],
})
export class OrderListDetailPage implements OnInit {
  id: string;
  order: Order | any;
  deliveryCharge: number = 2500; //일단 고정 값
  item = 4;
  master: User[];

  constructor(
    private navc: NavController,
    private route: ActivatedRoute,
    private db: DbService,
    private modalController: ModalController,
    private alertService: AlertService,
    private chatService: ChatService
  ) {
    this.id = this.route.snapshot.queryParams.id;
  }

  async ngOnInit() {
    this.order = await this.getOrder();
    this.master = await this.db.getMaster();
    console.log('this.master', this.master);
  }

  //주문한 상품 데이터 가져오기
  getOrder(): Promise<any> {
    return this.db
      .doc$(`order/${this.id}`)
      .pipe(ArrayJoin(this.db.afs, 'cartIds', 'cart'))
      .pipe(
        map((data: any) => {
          data['status'] = data.shipmentStatus;

          //cart중에 교환, 반품 상품
          const productStatus = data.cartIds.filter(
            (data) => data.productStatus
          );

          if (
            data.shipmentStatus == '배송준비중' ||
            data.shipmentStatus == '배송중' ||
            data.shipmentStatus == '취소대기' ||
            data.shipmentStatus == '취소완료'
          ) {
            data['isFirst'] = true;
          } else if (
            data.shipmentStatus == '배송완료' &&
            (!productStatus || productStatus.length < 1)
          ) {
            data['isFirst'] = true;
          } else {
            data['isFirst'] = false;
          }

          const cartIds = data.cartIds;
          data.cartIds = cartIds.filter((ele) => !ele.deleteSwitch);

          return data;
        })
      )
      .pipe(take(1))
      .toPromise();
  }

  //삭제
  async del() {
    this.alertService
      .cancelOkBtn(
        'alert confirm',
        `${String(
          this.order.cartIds ? this.order.cartIds.length : 0
        )}개 상품 주문 내역을 삭제하시겠습니까?`,
        '',
        '취소',
        '삭제'
      )
      .then((ok) => {
        if (ok) {
          this.db
            .updateAt(`order/${this.order.id}`, {
              deleteSwitch: true,
            })
            .then(() => {
              this.navc.pop();
              this.complete();
            });
        }
      });
  }

  //주문내역 삭제 완료 토스트
  complete() {
    this.alertService.toast('주문 내역을 삭제했습니다.', 'toast');
  }

  //비활성화 조건
  disabledCheck() {
    const cartStatus = this.order.cartIds.filter(
      (ele: any) => ele.productStatus
    );
    const doneStatus = this.order.cartIds.filter(
      (ele: any) => ele.productStatus && ele.doneSwitch
    );

    if (this.order.shipmentStatus == '취소완료') {
      return false;
    }

    //취소/교환/반품이 없는데 배송완료 됐을때
    if (
      (!cartStatus || cartStatus.length < 1) &&
      this.order.shipmentStatus == '배송완료'
    ) {
      return false;
    }

    //
    if (
      this.order.shipmentStatus == '배송완료' &&
      cartStatus &&
      doneStatus &&
      cartStatus.length == doneStatus.length
    ) {
      return false;
    }

    return true;
  }

  async showTrackingModal() {
    console.log('this.order', this.order);

    const modal = await this.modalController.create({
      component: TrackingModalPage,
      componentProps: { order: this.order },
    });

    await modal.present();
  }

  goChat() {
    console.log('this.master[0]', this.master[0]);

    this.chatService.createChat(this.master[0], true);
  }
}
