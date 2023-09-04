import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { map, take } from 'rxjs/operators';
import { Cart } from 'src/app/models/cart';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DbService, leftJoinDocument } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.page.html',
  styleUrls: ['./basket.page.scss'],
})
export class BasketPage implements OnInit {
  carts: Array<Cart> = [];
  checkItems: Array<Cart> = [];
  currentUser: any;
  allChecked: boolean = true;
  deliveryCharge: number = 2500; //일단 고정 값

  constructor(
    private navc: NavController,
    private db: DbService,
    private auth: AuthService,
    private loadingService: LoadingService,
    private alertService: AlertService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    await this.loadingService.load();
    this.currentUser = await this.auth.getUser();
    if (this.currentUser) {
      this.carts = await this.getCart();
      this.checkItems = this.carts;
    }
    this.loadingService.hide();
  }

  //장바구니 cart 데이터 가져오기
  getCart(): Promise<any> {
    return this.db
      .collection$('cart', (ref) =>
        ref
          .where('uid', '==', this.currentUser.uid)
          .where('orderDoneSwitch', '==', false)
          .orderBy('dateCreated', 'desc')
      )
      .pipe(
        map((datas: any) => {
          if (datas && datas.length > 0) {
            datas.map((data) => {
              let totalPrice = 0;
              const price = data.productInfo.discountPrice
                ? data.productInfo.discountPrice
                : data.productInfo.price;
              totalPrice = data.count * Number(price);

              data['totalPrice'] = totalPrice;
              data['check'] = true;

              return data;
            });
            return datas;
          } else {
            return [];
          }
        })
      )
      .pipe(leftJoinDocument(this.db.afs, 'productId', 'product')) //상품 조인
      .pipe(take(1))
      .toPromise();
  }

  //상품 수량 증가 [+]
  increaseAmount(item: any) {
    if (item.count < 10) {
      item.count++;
      this.setItemTotal(item);
      this.seveCount(item.id, 1);
    }
  }

  //상품 수량 감소 [+]
  decreaseAmount(item: any) {
    if (item.count > 1) {
      item.count--;
      this.setItemTotal(item);
      this.seveCount(item.id, -1);
    }
  }

  //상품 수량에 따른 가격 + / -
  setItemTotal(item) {
    const oldItem = { ...item };

    let totalPrice = 0;
    const price = oldItem.productInfo.discountPrice
      ? oldItem.productInfo.discountPrice
      : oldItem.productInfo.price;
    totalPrice = item.count * Number(price);

    item.totalPrice = totalPrice;
  }

  seveCount(id, num) {
    this.db.updateAt(`cart/${id}`, {
      count: firebase.default.firestore.FieldValue.increment(num),
    });
  }

  //전체 삭제
  allDel() {
    if (!this.checkItems || this.checkItems.length < 1) {
      return false;
    }

    this.alertService
      .cancelOkBtn(
        'alert confirm',
        '선택하신 상품을 장바구니에서 \n 삭제하시겠습니까?',
        '',
        '취소',
        '삭제하기'
      )
      .then((ok) => {
        if (ok) {
          if (this.checkItems && this.checkItems.length > 0) {
            for (let index = 0; index < this.checkItems.length; index++) {
              const item = this.checkItems[index];

              this.db.delete(`cart/${item.id}`).then(() => {
                this.db.updateAt(`users/${this.currentUser.uid}`, {
                  cartCount:
                    firebase.default.firestore.FieldValue.increment(-1),
                });
              });

              if (index + 1 == this.checkItems.length) {
                this.checkItems.forEach((ele) => {
                  const index = this.carts.indexOf(ele);
                  this.carts.splice(index, 1);
                  this.complete();
                });
              }
            }
          }
        }
      });
  }

  //상품 삭제
  async ItemDel(item) {
    const oldItem = item;
    this.alertService
      .cancelOkBtn(
        'alert confirm',
        '해당 상품을 장바구니에서 \n 삭제하시겠습니까?',
        '',
        '취소',
        '삭제하기'
      )
      .then((ok) => {
        if (ok) {
          this.db.delete(`cart/${item.id}`).then(() => {
            this.db.updateAt(`users/${this.currentUser.uid}`, {
              cartCount: firebase.default.firestore.FieldValue.increment(-1),
            });
            const index = this.carts.indexOf(oldItem);
            this.carts.splice(index, 1);
            this.checkCart(2);
            this.complete();
          });
        }
      });
  }

  //삭제 후 알럿
  complete() {
    this.alertService.toast('장바구니에서 삭제했습니다.', 'toast');
    this.checkItems = [];
  }

  //오더페이지로 넘어가기
  goOrder() {
    //배송지 없을때
    if (
      !this.currentUser.addressDetail ||
      !this.currentUser.recipient ||
      !this.currentUser.deliveryPhone ||
      !this.currentUser.address
    ) {
      this.alertService
        .cancelOkBtn(
          'alert confirm',
          '배송 정보가 입력되지 않았습니다. 배송주소 입력페이지로 이동합니다.'
        )
        .then((ok) => {
          if (ok) {
            this.navc.navigateForward(['/shop/myinfo-address']);
          }
        });

      return false;
    } else {
      this.checkSoldOut();
    }
  }

  //재고 확인하기
  checkSoldOut() {
    let productIds = [];
    this.checkItems.forEach((ele: any) => {
      if (ele.check) {
        productIds.push(ele.productId.id);
      }
    });

    //체크된 아이디의 상품 다시가져오기
    const ids = productIds;
    if (!ids || !ids.length) return [];

    const batches = [];

    while (ids.length) {
      const batch = ids.splice(0, 10);

      // add the batch request to to a queue
      batches.push(
        this.db
          .collection$('product', (ref) => ref.where('id', 'in', [...batch]))
          .pipe(take(1))
          .toPromise()
      );
    }

    Promise.all(batches).then((content) => {
      const checkItems = this.carts.filter((item: any) => item.check);

      //가져온 상품들 프로미스 풀기
      const checkProduct = [].concat(...content);
      //솔드 아웃 리스트
      const soldOutList = checkProduct.filter((checkEle) => {
        if (checkEle.stockCount < 1) {
          //재고가 없으면 true
          return true;
        } else {
          //재고가 있을때는 내가 선택한 물량과 맞는지
          let tmp = [];
          checkItems.forEach((checkItem: any) => {
            if (
              checkEle.id == checkItem.productId.id &&
              checkEle.stockCount < checkItem.count
            ) {
              tmp.push(checkEle);
            } else {
              return false;
            }
          });
          return tmp.find((ele) => ele.id == checkEle.id);
        }
      });

      //솔드아웃 리스트의 아이디만
      const soldOutIds = soldOutList.map((ele) => ele.id);

      //솔드 아웃 리스트의 id 와 비교
      let cartIds = [];
      checkItems.forEach((ele: any) => {
        if (ele.check && !soldOutIds.includes(ele.productId.id)) {
          cartIds.push(ele.id);
        }
      });

      if (
        soldOutList &&
        soldOutList.length > 0 &&
        soldOutList.length < checkItems.length
      ) {
        //품절 혹은 재고가 부족한 상품이 있음
        this.alertService
          .cancelOkBtn(
            '',
            '품절된 상품이 있습니다. 품절된 상품을 제외하고 구매하시겠습니까?'
          )
          .then((ok) => {
            if (ok) {
              this.navc.navigateForward(['/shop/order'], {
                queryParams: { cartIds, page: 'basket' },
              });
            }
          });
      } else if (
        soldOutList &&
        soldOutList.length > 0 &&
        soldOutIds.length == checkItems.length
      ) {
        //모든 상품이 품절되었거나 재고가 부족함
        this.alertService.okBtn('', '선택하신 상품이 모두 품절되었습니다.');
      } else {
        //모든 상품이 그냥 구매가능함
        this.navc.navigateForward(['/shop/order'], {
          queryParams: { cartIds, page: 'basket' },
        });
      }
    });
  }

  //장바구니에 담긴 상품이 없을 때 추천 상품 리스트로 가기
  goRecommend() {
    this.navc.navigateForward(['/shop/recommend']);
  }

  //체크박스
  checkCart(item: number) {
    if (item === 1) {
      this.carts.map((item: any) => {
        item.check = !this.allChecked;
        return item;
      });
      this.checkItems = this.carts.filter((ele: any) => ele.check);
    } else {
      setTimeout(() => {
        if (this.carts.every((item: any) => item.check == true)) {
          this.allChecked = true;
          this.checkItems = this.carts.filter((ele: any) => ele.check);
        } else if (this.carts.some((item: any) => item.check == false)) {
          this.allChecked = false;
          this.checkItems = this.carts.filter((ele: any) => ele.check);
        }
      }, 100);
    }
  }

  //총 결제 금액
  totalPrice() {
    const checkItem = this.carts.filter((item: any) => item.check);
    if (checkItem && checkItem.length > 0) {
      let result = 0;
      checkItem.map((item) => {
        const price = item.productInfo.discountPrice
          ? item.productInfo.discountPrice
          : item.productInfo.price;
        result += item.count * Number(price);
        return item;
      });

      return result;
    } else {
      return 0;
    }
  }
}
