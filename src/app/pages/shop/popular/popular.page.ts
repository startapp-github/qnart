import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, NavController } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { category } from 'src/app/classes/category';
import { User } from 'src/app/classes/user';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ArrayJoin, DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-popular',
  templateUrl: './popular.page.html',
  styleUrls: ['./popular.page.scss'],
})
export class PopularPage implements OnInit {
  cartegory = '';
  @ViewChild('content') content: IonContent;
  heart: boolean;

  topCategories: Array<category> = [];
  popularItems: Array<any> = [];
  masterInfo: any;
  popularProducts: Array<any> = [];
  currentUser: any;
  filter: string = '최신순';
  /**
   * TODO user$에 명시된 User는 커뮤니티 프로젝트의 models user 타입.
   * 하지만 auth.user$에 명시된 User 타입은 쇼핑몰 프로젝트의 classes user 타입.
   * 그래서 서로 타입이 일치하지 않는 문제로 인해 명시 타입에 임시로 any 추가
   */
  user$: Observable<User | any>;
  lastIndex: number = 16;
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
    this.cartegory = this.topCategories[0].id; //세그먼트 체인지

    this.user$ = this.auth.user$.pipe(
      map((user) => {
        this.currentUser = user;
        return user;
      })
    );

    this.getMaster();
  }

  ionViewWillEnter() {}

  //인기상품 데이터 가져오기
  getMaster() {
    this.master$ = this.changeMaster$.pipe(
      switchMap((category: string) => {
        return this.db
          .doc$('master/masterInfo')
          .pipe(ArrayJoin(this.db.afs, 'popularList', 'product'))
          .pipe(
            map((datas: any) => {
              const uid = this.currentUser ? this.currentUser.uid : '';

              const popularProducts = datas.popularList.filter((ele) => {
                return (
                  ele.topCategory == category &&
                  !ele.deleteSwitch &&
                  ele.showSwitch
                );
              });

              popularProducts.map((item) => {
                if (item.heartList.includes(uid)) {
                  item['heart'] = true;
                } else {
                  item['heart'] = false;
                }
                return item;
              });
              this.filter = '최신순';

              this.popularProducts = popularProducts.sort((a, b) => {
                return (
                  new Date(b.dateCreated).getTime() -
                  new Date(a.dateCreated).getTime()
                );
              });
              this.loadingService.hide();
              return this.popularProducts;
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

  //찜 추가
  Pick() {
    this.alertService.toast('찜한상품 목록에 추가했습니다.', 'toast');
  }

  //찜 삭제 완료 토스트
  dePickToast() {
    this.alertService.toast('찜한상품 목록에서 삭제했습니다.', 'toast');
  }

  //찜 삭제
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
    const items = this.popularProducts.sort((a, b) => {
      return (
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      );
    });

    switch (this.filter) {
      case '최신순':
        this.popularItems = items.sort((a, b) => {
          return (
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime()
          );
        });
        break;
      case '낮은가격순':
        this.popularItems = items.sort((a, b) => {
          const priceA = a.discountPrice ? a.discountPrice : a.price;
          const priceB = b.discountPrice ? b.discountPrice : b.price;

          return priceA - priceB;
        });
        break;
      case '높은가격순':
        this.popularItems = items.sort((a, b) => {
          const priceA = a.discountPrice ? a.discountPrice : a.price;
          const priceB = b.discountPrice ? b.discountPrice : b.price;

          return priceB - priceA;
        });
        break;
      case '판매량순':
        this.popularItems = items.sort((a, b) => {
          return b.salesCount - a.salesCount;
        });
        break;

      default:
        break;
    }
  }

  top() {
    setTimeout(() => {
      this.content.scrollToPoint(0, 0, 500);
    }, 200);
  }

  onScroll($event) {
    let scrollTop = $event.detail.scrollTop;
    if (scrollTop <= 150) {
      document.getElementById('scroll7').classList.remove('active');
    } else {
      document.getElementById('scroll7').classList.add('active');
    }
  }

  //상품 디테일
  goItemDetail(item) {
    this.navc.navigateForward(['/shop/product-detail'], {
      queryParams: { id: item.id },
    });
  }

  //검색 이동
  goSearch() {
    this.navc.navigateForward(['/shop/search']);
  }

  //장바구니
  goBasket() {
    this.navc.navigateForward(['/shop/basket']);
  }

  //인피니트 스크롤 16개씩
  loadData(event) {
    setTimeout(() => {
      this.lastIndex += 16;
      event.target.complete();
      if (this.popularItems.length <= this.lastIndex) {
        event.target.disabled = true;
      }
    }, 500);
  }
}
