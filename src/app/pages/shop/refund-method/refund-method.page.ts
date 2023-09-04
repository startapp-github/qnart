import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-refund-method',
  templateUrl: './refund-method.page.html',
  styleUrls: ['./refund-method.page.scss'],
})
export class RefundMethodPage implements OnInit {
  id: string;
  deliveryCharge: number = 2500; //일단 고정 값
  method: string;
  constructor(
    private navc: NavController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {
    this.id = this.route.snapshot.queryParams.id;
  }

  ngOnInit() {}

  //반품 상품
  goproduct() {
    this.navc.navigateForward(['/shop/refund-product'], {
      queryParams: {
        id: this.id,
        method: this.method,
      },
    });
  }

  //백버튼
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
}
