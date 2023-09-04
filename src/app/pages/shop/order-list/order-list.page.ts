/** @format */

import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController, NavController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Order } from 'src/app/models/order';
import { User } from 'src/app/models/user.models';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ArrayleftJoinDocument, DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';
import { OrderCancelPage } from '../order-cancel/order-cancel.page';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.page.html',
  styleUrls: ['./order-list.page.scss'],
})
export class OrderListPage implements OnInit {
  @ViewChild('content') content: IonContent;

  order$: Observable<Array<Order> | any> = of([]);
  user: User;

  constructor(
    private navc: NavController,
    public modalController: ModalController,
    private db: DbService,
    private auth: AuthService,
    public alertService: AlertService,
    public loadingService: LoadingService
  ) {}

  async ngOnInit() {
    await this.loadingService.load();
    this.user = await this.auth.getUser();
    this.getOrder();
  }

  //주문한 데이터 가져오기
  async getOrder() {
    this.order$ = this.db
      .collection$('order', (ref) =>
        ref
          .where('uid', '==', this.user.uid)
          .where('deleteSwitch', '==', false)
          .orderBy('dateCreated', 'desc')
      )
      .pipe(ArrayleftJoinDocument(this.db.afs, 'cartIds', 'cart'))
      .pipe(
        map((datas: any) => {
          if (datas?.length > 0) {
            datas.forEach((ele) => {
              ///배송준비중, 배송중, 배송완료, 취소중, 취소완료 일때는 첫번째에만 떠야하고

              ele['status'] = ele.shipmentStatus;

              const productStatus = ele.cartIds.filter(
                (data) => data.productStatus
              );

              if (
                ele.shipmentStatus == '배송준비중' ||
                ele.shipmentStatus == '배송중' ||
                ele.shipmentStatus == '취소대기' ||
                ele.shipmentStatus == '취소완료'
              ) {
                ele['isFirst'] = true;
              } else if (
                ele.shipmentStatus == '배송완료' &&
                (!productStatus || productStatus.length < 1)
              ) {
                ele['isFirst'] = true;
              } else {
                ele['isFirst'] = false;
              }

              const cartIds = ele.cartIds;
              ele.cartIds = cartIds.filter((ele) => !ele.deleteSwitch);
            });
            this.loadingService.hide();
            return datas;
          } else {
            this.loadingService.hide();
            return [];
          }
        })
      );

    const list = await this.order$.pipe(take(1)).toPromise();
    console.log('list', list);
  }

  onScroll($event) {
    let scrollTop = $event.detail.scrollTop;

    if (scrollTop <= 150) {
      document.getElementById('scroll6').classList.remove('active');
    } else {
      document.getElementById('scroll6').classList.add('active');
    }
  }

  top() {
    setTimeout(() => {
      this.content.scrollToPoint(0, 0, 500);
    }, 200);
  }

  //상품 상태 확인
  checkStatus(order) {
    const tmp = order.cartIds.filter((ele) => ele.productStatus);

    if (tmp && tmp.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  //주문 취소 알럿
  async orderCancel(order) {
    if (
      order.shipmentStatus == '배송중' ||
      order.shipmentStatus == '배송완료'
    ) {
      this.alertService.okBtn(
        'alert',
        '이미 배송 중인 상품은 취소할 수 없습니다.'
      );

      return false;
    }

    this.alertService
      .cancelOkBtn('alert confirm', '주문을 취소하시겠습니까?')
      .then((ok) => {
        if (ok) {
          this.completeCancel(order);
        }
      });
  }

  //주문 취소 모달
  async cancelModal(order) {
    const modal = await this.modalController.create({
      component: OrderCancelPage,
      cssClass: 'buy-popup',
      componentProps: {
        id: order.id,
      },
    });
    return await modal.present();
  }

  //주문 취소
  async completeCancel(order) {
    await this.db.updateAt(`order/${order.id}`, {
      shipmentStatus: '취소대기',
      cancelDate: new Date().toISOString(),
    });

    const promise = order.cartIds.map(async (ele: any) => {
      return this.db.updateAt(`cart/${ele.id}`, {
        productStatus: '취소',
        doneSwitch: false,
        dateCreated: new Date().toISOString(),
      });
    });
    await Promise.all(promise);

    setTimeout(() => {
      this.cancelModal(order);
    }, 300);
  }

  //삭제
  del(cart, order) {
    if (order.shipmentStatus == '배송중') {
      this.alertService.okBtn('alert', '배송중인 상품은 삭제가 불가합니다.');

      return false;
    }

    this.alertService
      .cancelOkBtn('alert confirm', '주문 내역을 삭제하시겠습니까?')
      .then((ok) => {
        if (ok) {
          this.db
            .updateAt(`cart/${cart.id}`, {
              deleteSwitch: true,
            })
            .then(() => {
              this.complete();
            });
        }
      });
  }

  //교환, 반품 가능한 기간이 지난 경우 알럿
  NotChange() {
    this.alertService.okBtn(
      'alert',
      '교환, 반품이 가능한 기간이 지났습니다.\n 교환, 반품은 상품 구매 후 30일 이내 가능합니다.'
    );
  }

  //삭제 완료 토스트
  complete() {
    this.alertService.toast('주문 내역을 삭제했습니다.', 'toast');
  }

  //교환/반품 신청 취소
  async changeCancel(cart, order) {
    this.alertService
      .cancelOkBtn(
        'alert confirm header',
        '교환/반품 신청을 취소하시겠습니까?',
        '교환/반품 취소',
        '닫기'
      )
      .then((ok) => {
        if (ok) {
          const changeCart = { ...cart };

          if (cart.productStatus == '교환') {
            changeCart.options = cart.changeOptions;
            delete changeCart.changeOptions;
            delete changeCart.productStatus;
            delete changeCart.reason;
            delete changeCart.detailReason;
            delete changeCart.reasonImages;
            changeCart.dateCreated = order.dateCreated;

            this.db
              .newUpdateAt(`cart/${changeCart.id}`, changeCart)
              .then(() => {
                this.changeCancelM(cart);
              });
          } else {
            delete changeCart.productStatus;
            delete changeCart.reason;
            delete changeCart.detailReason;
            delete changeCart.reasonImages;
            changeCart.dateCreated = order.dateCreated;

            this.db
              .newUpdateAt(`cart/${changeCart.id}`, changeCart)
              .then(() => {
                this.changeCancelM(cart);
              });
          }
        }
      });
  }

  //교환/반품 신청 취소 완료 토스트
  changeCancelM(cart?: any) {
    this.alertService.toast('교환/반품 신청을 취소했습니다.', 'toast');
  }

  //주문 상세
  goDetail(order) {
    this.navc.navigateForward(['/shop/order-list-detail'], {
      queryParams: { id: order.id },
    });
  }

  //교환/반품 신청
  goChange(cart, order) {
    const orderDate = new Date(order.dateCreated).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    let btMs = today - orderDate;
    let btDay = btMs / (1000 * 60 * 60 * 24);
    if (btDay > 30) {
      this.alertService.okBtn(
        'alert',
        '교환, 반품이 가능한 기간이 지났습니다. 교환, 반품은 상품 구매 후 30일 이내 가능합니다.',
        '교환/반품 불가'
      );

      return false;
    }

    this.navc.navigateForward(['/shop/refund-method'], {
      queryParams: { id: cart.id },
    });
  }
}
