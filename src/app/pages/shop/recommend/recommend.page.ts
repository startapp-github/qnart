import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, NavController } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { category } from 'src/app/classes/category';
import { User } from 'src/app/models/user.models';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ArrayJoin, DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-recommend',
  templateUrl: './recommend.page.html',
  styleUrls: ['./recommend.page.scss'],
})
export class RecommendPage implements OnInit {
  cartegory = '';
  @ViewChild('content') content: IonContent;
  heart: boolean;
  topCategories: Array<category> = [];
  recommendItems: Array<any> = [];
  masterInfo: any;
  recommendProducts: Array<any> = [];
  currentUser: any;
  filter: string = '최신순';
  lastIndex: number = 16;
  user$: Observable<User>;
  master$: any;
  changeMaster$: BehaviorSubject<string> = new BehaviorSubject(this.cartegory);
  constructor(
    private navc: NavController,
    private db: DbService,
    private loadingService: LoadingService,
    private auth: AuthService,
    private alertService: AlertService
  ) {}

  async ngOnInit() {
    this.topCategories = await this.getTopCategory();
    this.user$ = this.auth.user$.pipe(
      map((user) => {
        this.currentUser = user;
        return user;
      })
    );
    this.cartegory = this.topCategories[0].id; //세그먼트 체인지

    this.getMaster();
  }

  //추천상품 담아 놓은 거 가져오기
  getMaster() {
    this.master$ = this.changeMaster$.pipe(
      switchMap((category: string) => {
        return this.db
          .doc$('master/masterInfo')
          .pipe(ArrayJoin(this.db.afs, 'recommendList', 'product'))
          .pipe(
            map((datas: any) => {
              const uid = this.currentUser ? this.currentUser.uid : '';

              const recommendProducts = datas.recommendList.filter((ele) => {
                return (
                  ele.topCategory == category &&
                  !ele.deleteSwitch &&
                  ele.showSwitch
                );
              });

              recommendProducts.map((item) => {
                if (item.heartList.includes(uid)) {
                  item['heart'] = true;
                } else {
                  item['heart'] = false;
                }
                return item;
              });

              this.recommendProducts = recommendProducts.sort((a, b) => {
                return (
                  new Date(b.dateCreated).getTime() -
                  new Date(a.dateCreated).getTime()
                );
              });
              this.filter = '최신순';
              this.loadingService.hide();
              return this.recommendProducts;
            })
          );
      })
    );
  }

  //카테고리 가져오기
  getTopCategory(): Promise<Array<category>> {
    return this.db
      .collection$('category', (ref) =>
        ref.where('type', '==', 'top').where('deleteSwitch', '==', false)
      )
      .pipe(take(1))
      .toPromise();
  }

  //인기상품 상위 카테고리 세그먼트 체인지
  async segmentChange() {
    await this.loadingService.load();
    this.changeMaster$.next(this.cartegory);
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

  //찜 추가 완료 토스트
  Pick() {
    this.alertService.toast('찜한상품 목록에 추가했습니다.', 'toast');
  }

  //찜 삭제 완료 토스트
  dePickToast() {
    this.alertService.toast('찜한상품 목록에서 삭제했습니다.', 'toast');
  }

  //찜 삭제 알럿
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

  //필터
  filterChange() {
    const items = this.recommendProducts.sort((a, b) => {
      return (
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      );
    });

    switch (this.filter) {
      case '최신순':
        this.recommendItems = items.sort((a, b) => {
          return (
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime()
          );
        });
        break;
      case '낮은가격순':
        this.recommendItems = items.sort((a, b) => {
          const priceA = a.discountPrice ? a.discountPrice : a.price;
          const priceB = b.discountPrice ? b.discountPrice : b.price;

          return priceA - priceB;
        });
        break;
      case '높은가격순':
        this.recommendItems = items.sort((a, b) => {
          const priceA = a.discountPrice ? a.discountPrice : a.price;
          const priceB = b.discountPrice ? b.discountPrice : b.price;

          return priceB - priceA;
        });
        break;
      case '판매량순':
        this.recommendItems = items.sort((a, b) => {
          return b.salesCount - a.salesCount;
        });
        break;

      default:
        break;
    }
  }

  onScroll($event) {
    let scrollTop = $event.detail.scrollTop;

    if (scrollTop <= 150) {
      document.getElementById('scroll9').classList.remove('active');
    } else {
      document.getElementById('scroll9').classList.add('active');
    }
  }

  top() {
    setTimeout(() => {
      this.content.scrollToPoint(0, 0, 500);
    }, 200);
  }

  loadData(event) {
    setTimeout(() => {
      this.lastIndex += 16;
      event.target.complete();
      if (this.recommendItems.length <= this.lastIndex) {
        event.target.disabled = true;
      }
    }, 500);
  }

  //상품상세
  goItemDetail(item) {
    this.navc.navigateForward(['/shop/product-detail'], {
      queryParams: { id: item.id },
    });
  }

  //검색
  goSearch() {
    this.navc.navigateForward(['/shop/search']);
  }

  //장바구니
  goBasket() {
    this.navc.navigateForward(['/shop/basket']);
  }
}
