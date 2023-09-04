import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, NavController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { ProductInquiry } from 'src/app/models/product-inquiry';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { DbService } from 'src/app/services/db.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-product-inquiry',
  templateUrl: './product-inquiry.page.html',
  styleUrls: ['./product-inquiry.page.scss'],
})
export class ProductInquiryPage implements OnInit {
  product;
  currentUser: any;
  inquiry: ProductInquiry = {
    id: '',
    title: '',
    content: '',
    lockSwitch: false,
    images: [],
    dateCreated: new Date().toISOString(),
    answer: '',
    deleteSwitch: false,
    answerSwitch: false,
    productId: '',
    answerDate: '',
    userId: '',
  };
  type;
  header: string;
  constructor(
    public actionSheetController: ActionSheetController,
    private navc: NavController,
    private route: ActivatedRoute,
    private db: DbService,
    private imageService: ImageService,
    private commonService: CommonService,
    private auth: AuthService,
    private alertService: AlertService
  ) {
    this.inquiry.productId = this.route.snapshot.queryParams.productId;
    this.inquiry.id = this.route.snapshot.queryParams.id;

    this.type = this.route.snapshot.queryParams.type;
  }

  async ngOnInit() {
    this.product = await this.getProduct();
    this.currentUser = await this.auth.getUser();
    this.title();
    if (this.type === 'edit') {
      this.inquiry = await this.getProductInquiry();
    }
  }

  //헤더 텍스트
  title() {
    if (this.type === 'edit') {
      this.header = '상품 문의 수정';
    } else if (this.type === 'write') {
      this.header = '상품 문의';
    }
  }

  //해당 상품 가져오기
  getProduct() {
    return this.db
      .doc$(`product/${this.inquiry.productId}`)
      .pipe(take(1))
      .toPromise();
  }

  //상품문의 가져오기(수정)
  getProductInquiry() {
    return this.db
      .doc$(`productInquiry/${this.inquiry.id}`)
      .pipe(take(1))
      .toPromise();
  }

  //내용 글자 수 체크
  lengthCheck() {
    if (this.inquiry.content) {
      if (this.inquiry.content.length > 500) {
        this.inquiry.content = this.inquiry.content.substr(0, 500);
      } else {
        return false;
      }
    }
  }

  select: any = {
    cssClass: 'select-box select-box2',
  };

  //카메라/갤러리
  async camera() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-actionSheet',
      buttons: [
        {
          text: '카메라',
          handler: () => {
            this.imageService.getCamera('inquiry').then((url) => {
              this.inquiry.images.push(url);
            });
          },
        },
        {
          text: '갤러리',
          handler: () => {
            this.imageService.getGallery('inquiry').then((url) => {
              this.inquiry.images.push(url);
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

  //작성완료 알럿
  complete() {
    this.alertService
      .cancelOkBtn(
        'alert confirm head',
        '상품 문의를 작성하시겠습니까?',
        '작성 완료',
        '취소',
        '저장하기'
      )
      .then((ok) => {
        if (ok) {
          this.postsave();
          this.navc.pop();
        }
      });
  }

  //저장
  save() {
    this.alertService
      .cancelOkBtn(
        'alert confirm head',
        '상품 문의 작성을 완료하시겠습니까?',
        '작성 완료',
        '취소',
        '작성하기'
      )
      .then((ok) => {
        if (ok) {
          if (this.type === 'write') {
            this.update();
          } else if (this.type === 'edit') {
            this.edit();
          }
        }
      });
  }

  //작성 업데이트
  update() {
    this.inquiry.id = this.commonService.generateFilename();
    this.inquiry.userId = this.currentUser.id;
    this.db
      .updateAt(`productInquiry/${this.inquiry.id}`, this.inquiry)
      .then(() => {
        this.postsave();
        this.navc.pop();
      });
  }

  //수정 업데이트
  edit() {
    this.db
      .updateAt(`productInquiry/${this.inquiry.id}`, {
        title: this.inquiry.title,
        content: this.inquiry.content,
        lockSwitch: this.inquiry.lockSwitch,
        images: this.inquiry.images,
        userId: this.currentUser.id,
      })
      .then(() => {
        this.postsave();
        this.navc.pop();
      });
  }

  //문의 작성 완료 토스트
  postsave() {
    this.alertService.toast('상품 문의를 작성했습니다.', 'toast');
  }

  //백버튼
  async cancel() {
    this.alertService
      .cancelOkBtn(
        'alert confirm head',
        '작성하신 내용이 저장되지 않았습니다.\n 그래도 나가시겠습니까?',
        '나가기',
        '취소',
        '나가기'
      )
      .then((ok) => {
        if (ok) {
          this.navc.pop();
        }
      });
  }

  //삭제
  delete(index) {
    this.inquiry.images.splice(index, 1);
  }
}
