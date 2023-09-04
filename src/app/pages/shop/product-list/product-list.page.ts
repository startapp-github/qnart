import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, NavController } from '@ionic/angular';
import { IonInfiniteScroll } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { User } from 'src/app/models/user.models';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage implements OnInit {
  @ViewChild('content') content: IonContent;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  category = '';
  topCategoryId: string;
  subCategoryId: string;
  heart: boolean;
  categories;
  topCategory: Array<any> | any = [];
  subCategory: Array<any> = [];
  products: Array<any> = [];
  product: Array<any> = [];
  filter: string = '최신순';
  sortProducts: Array<any> = [];
  currentUser: any;
  lastIndex: number = 16;
  user$: Observable<User>;
  constructor(
    private navc: NavController,
    private route: ActivatedRoute,
    private db: DbService,
    private alertService: AlertService,
    private auth: AuthService
  ) {
    //가져온 파람즈
    //topID
    //subID
    this.topCategoryId = this.route.snapshot.queryParams.topCategoryId;
    this.subCategoryId = this.route.snapshot.queryParams.subCategoryId;
  }

  async ngOnInit() {
    this.user$ = this.auth.user$;
    this.category = this.subCategoryId;
    this.categories = await this.getCategory();
    this.products = await this.getProduct();

    this.checkSubCategory();
  }

  async ionViewWillEnter() {
    this.currentUser = await this.auth.getUser();
  }

  getCategory() {
    //topID가 같은 카테고리 모두
    // tpye == top 카테고리 => 오브젝트 하나
    //tpye == middle 서브 카테고리 배열
    return this.db
      .collection$('category', (ref) =>
        ref
          .where('topCategoryId', '==', this.topCategoryId)
          .where('deleteSwitch', '==', false)
      )
      .pipe(
        map((categories) => {
          this.topCategory = categories.find((ele) => ele.type == 'top');
          this.subCategory = categories.filter((ele) => ele.type == 'middle');
          return categories;
        })
      )
      .pipe(take(1))
      .toPromise();
  }

  //상품 데이터 가져오기
  getProduct() {
    //topID만 같은거
    return this.db
      .collection$('product', (ref) =>
        ref
          .where('topCategory', '==', this.topCategoryId)
          .where('deleteSwitch', '==', false)
          .where('showSwitch', '==', true)
      )
      .pipe(take(1))
      .toPromise();
  }

  // 세그먼트 별
  checkSubCategory() {
    if (this.category === '전체') {
      this.product = this.products;
    } else {
      this.product = this.products.filter((item) => {
        return item && item.subCategory == this.category;
      });
    }
    if (this.filter !== '최신순') {
      this.filter = '최신순';
    }
    const uid = this.currentUser ? this.currentUser.uid : '';
    this.product.map((item) => {
      if (item.heartList.includes(uid)) {
        item['heart'] = true;
      } else {
        item['heart'] = false;
      }
      return item;
    });
    this.sortProducts = this.product.sort((a, b) => {
      return (
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      );
    });
  }

  //필터
  filterChange() {
    const items = this.product.sort((a, b) => {
      return (
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      );
    });
    switch (this.filter) {
      case '최신순':
        this.sortProducts = items.sort((a, b) => {
          return (
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime()
          );
        });
        break;
      case '낮은가격순':
        this.sortProducts = items.sort((a, b) => {
          const priceA = a.discountPrice ? a.discountPrice : a.price;
          const priceB = b.discountPrice ? b.discountPrice : b.price;

          return priceA - priceB;
        });
        break;
      case '높은가격순':
        this.sortProducts = items.sort((a, b) => {
          const priceA = a.discountPrice ? a.discountPrice : a.price;
          const priceB = b.discountPrice ? b.discountPrice : b.price;

          return priceB - priceA;
        });
        break;
      case '판매량순':
        this.sortProducts = items.sort((a, b) => {
          return b.salesCount - a.salesCount;
        });
        break;

      default:
        break;
    }
  }

  //좋아요
  async like(item) {
    if (this.currentUser) {
      if (item.heart) {
        this.DeletePick(item);
      } else {
        this.db
          .updateAt(`product/${item.id}`, {
            heartList: firebase.default.firestore.FieldValue.arrayUnion(
              this.currentUser.uid
            ),
          })
          .then(() => {
            item.heart = true;
            item.heartList.push(this.currentUser.uid);
            this.Pick();
          });
      }
    } else {
      this.alertService.noneUser();
    }
  }

  //좋아요 추가 토스트
  Pick() {
    this.alertService.toast('찜한상품 목록에 추가했습니다.', 'toast');
  }

  //좋아요 삭제
  DeletePick(item) {
    this.alertService
      .cancelOkBtn('alert confirm', '찜한상품 목록에서 삭제하시겠습니까?')
      .then((ok) => {
        if (ok) {
          this.db
            .updateAt(`product/${item.id}`, {
              heartList: firebase.default.firestore.FieldValue.arrayRemove(
                this.currentUser.uid
              ),
            })
            .then(() => {
              this.dePickToast();
              item.heart = false;
              item.heartList.pop();
            });
        }
      });
  }

  dePickToast() {
    this.alertService.toast('찜한상품 목록에서 삭제했습니다.', 'toast');
  }

  top() {
    setTimeout(() => {
      this.content.scrollToPoint(0, 0, 500);
    }, 200);
  }

  onScroll($event) {
    let scrollTop = $event.detail.scrollTop;

    if (scrollTop <= 150) {
      document.getElementById('scroll8').classList.remove('active');
    } else {
      document.getElementById('scroll8').classList.add('active');
    }
  }

  //상품 상세
  goDetail(item) {
    this.navc.navigateForward(['/shop/product-detail'], {
      queryParams: { id: item.id },
    });
  }

  //검색으로 이동
  gosearch() {
    this.navc.navigateForward(['/shop/search']);
  }

  //장바구니
  gobasket() {
    this.navc.navigateForward(['/shop/basket']);
  }

  //인피니트 스크롤
  loadData(event) {
    setTimeout(() => {
      this.lastIndex += 16;
      event.target.complete();
      if (this.sortProducts.length <= this.lastIndex) {
        event.target.disabled = true;
      }
    }, 500);
  }
}
