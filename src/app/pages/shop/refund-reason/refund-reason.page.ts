import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  NavController,
  AlertController,
  ActionSheetController,
} from '@ionic/angular';
import { take } from 'rxjs/operators';
import { Cart } from 'src/app/models/cart';
import { AlertService } from 'src/app/services/alert.service';
import { DbService } from 'src/app/services/db.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-refund-reason',
  templateUrl: './refund-reason.page.html',
  styleUrls: ['./refund-reason.page.scss'],
})
export class RefundReasonPage implements OnInit {
  id: string;
  cart: Cart;
  method: string;
  reasonList = [
    '단순 변심',
    '색상/사이즈가 기대와 다름',
    '상품 결함이 있음',
    '실제 상품이 상품 설명과 다름',
    '상품이 늦게 배송됨',
    '기타',
  ];

  constructor(
    private navc: NavController,
    private alertController: AlertController,
    public actionSheetController: ActionSheetController,
    private route: ActivatedRoute,
    private db: DbService,
    private imageService: ImageService,
    private alertService: AlertService
  ) {
    this.id = this.route.snapshot.queryParams.id;
    this.method = this.route.snapshot.queryParams.method;
  }

  async ngOnInit() {
    if (this.method == 'change') {
      const newCart = JSON.parse(localStorage.getItem('newCart'));
      localStorage.removeItem('newCart');
      this.cart = await this.getCart();
      this.cart.options = newCart.options;
      this.cart.changeOptions = newCart.changeOptions;
      this.cart.productStatus = newCart.productStatus;
      this.cart.reason = '';
      this.cart.detailReason = '';
      this.cart.reasonImages = [];
    } else {
      this.cart = await this.getCart();
      this.cart.productStatus = '반품';
      this.cart.reason = '';
      this.cart.detailReason = '';
      this.cart.reasonImages = [];
    }
  }

  getCart(): Promise<Cart> {
    return this.db.doc$(`cart/${this.id}`).pipe(take(1)).toPromise();
  }

  goproduct() {
    this.navc.navigateBack(['/shop/refund-product']);
  }

  //완료
  gocomplete() {
    this.alertService
      .cancelOkBtn(
        'my-alert',
        '교환, 반품을 신청하시겠습니까?',
        '작성 완료',
        '취소',
        '신청하기'
      )
      .then((res) => {
        if (res) {
          this.cart.dateCreated = new Date().toISOString();
          this.db.updateAt(`cart/${this.cart.id}`, this.cart).then(() => {
            this.navc.navigateForward(['/refund-reason-complete'], {
              queryParams: { id: this.cart.id },
            });
          });
        }
      });
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

  //사진 선택
  async camera() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-actionSheet',
      buttons: [
        {
          text: '카메라',
          handler: () => {
            this.imageService.getCamera('refund').then((url) => {
              this.cart.reasonImages.push(url);
            });
          },
        },
        {
          text: '갤러리',
          handler: () => {
            this.imageService.getGallery('refund').then((url) => {
              this.cart.reasonImages.push(url);
            });
          },
        },
        {
          cssClass: 'my-actionSheet-cancel',
          text: '취소',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    await actionSheet.present();
  }

  deleteImage(i) {
    this.cart.reasonImages.splice(i, 1);
  }

  reasonCheck(e) {
    this.cart.reason = e;
  }
}
