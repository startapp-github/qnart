import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Order } from 'src/app/models/order';
import { ArrayJoin, DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-refund-detail',
  templateUrl: './refund-detail.page.html',
  styleUrls: ['./refund-detail.page.scss'],
})
export class RefundDetailPage implements OnInit {
  id: string;
  order: Order | any;
  deliveryCharge: number = 2500; //일단 고정 값
  constructor(private route: ActivatedRoute, private db: DbService) {
    this.id = this.route.snapshot.queryParams.id;
  }

  async ngOnInit() {
    this.order = await this.getOrder();
  }

  //주문 했던 내역 가져오기
  getOrder(): Promise<any> {
    return this.db
      .doc$(`order/${this.id}`)
      .pipe(ArrayJoin(this.db.afs, 'cartIds', 'cart'))
      .pipe(
        map((data: any) => {
          data['status'] = data.shipmentStatus;
          const checkStatus = data.cartIds.filter(
            (ele) => ele.productStatus && !ele.doneSwitch
          );
          const productStatus = data.cartIds.filter((ele) => ele.productStatus);
          const doneStatus = data.cartIds.filter((ele) => ele.doneSwitch);

          if (checkStatus && checkStatus.length > 0) {
            data['status'] = productStatus[0]?.productStatus + '대기';
          }

          if (
            data.shipmentStatus == '배송완료' &&
            productStatus &&
            doneStatus &&
            productStatus.length > 0 &&
            doneStatus.length > 0 &&
            productStatus.length == doneStatus.length
          ) {
            data['status'] = productStatus[0]?.productStatus + '완료';
          }

          return data;
        })
      )
      .pipe(take(1))
      .toPromise();
  }
}
