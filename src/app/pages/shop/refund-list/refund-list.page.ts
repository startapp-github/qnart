import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { combineLatest, of } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { Cart } from 'src/app/models/cart';
import { User } from 'src/app/models/user.models';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-refund-list',
  templateUrl: './refund-list.page.html',
  styleUrls: ['./refund-list.page.scss'],
})
export class RefundListPage implements OnInit {
  cartList;
  user: User;
  constructor(
    private navc: NavController,
    private db: DbService,
    private auth: AuthService,
    public loadingService: LoadingService
  ) {}

  async ngOnInit() {
    await this.loadingService.load();
    this.user = await this.auth.getUser();
    this.cartList = await this.getData();
    this.loadingService.hide();
    console.log(this.cartList);
  }

  //장바구니 데이터 가져오기
  getData(): Promise<Array<Cart>> {
    return this.db
      .collection$('cart', (ref) =>
        ref
          .where('uid', '==', this.user.uid)
          .where('deleteSwitch', '==', false)
          .orderBy('dateCreated', 'desc')
      )
      .pipe(
        map((datas) => {
          const setData = datas.filter((ele) => ele.productStatus);

          return setData ? setData : [];
        })
      )
      .pipe(
        switchMap((datas) => {
          if (datas && datas.length > 0) {
            let result = [];
            datas.forEach((data) => {
              const tmp$ = this.db
                .collection$('order', (ref) =>
                  ref.where('cartIds', 'array-contains', data.id)
                )
                .pipe(
                  map((item) => {
                    return { ...data, order: item[0] };
                  })
                );

              result.push(tmp$);
            });

            return combineLatest(result);
          } else {
            return of([]);
          }
        })
      )
      .pipe(take(1))
      .toPromise();
  }

  //취소교환반품 상세
  goDetail(cart) {
    this.navc.navigateForward(['/shop/redund-detail-cart'], {
      queryParams: {
        id: cart.id,
      },
    });
  }
}
