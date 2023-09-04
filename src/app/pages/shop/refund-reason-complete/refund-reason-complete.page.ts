import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { map, take } from 'rxjs/operators';
import { Cart } from 'src/app/models/cart';
import { Order } from 'src/app/models/order';
import { User } from 'src/app/models/user.models';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-refund-reason-complete',
  templateUrl: './refund-reason-complete.page.html',
  styleUrls: ['./refund-reason-complete.page.scss'],
})
export class RefundReasonCompletePage implements OnInit {
  id: string;
  cart: Cart;
  order: Order;
  user: User;
  constructor(
    private navc: NavController,
    private db: DbService,
    private route: ActivatedRoute,
    public loadingService: LoadingService,
    private auth: AuthService
  ) {
    this.id = this.route.snapshot.queryParams.id;
  }

  async ngOnInit() {
    await this.loadingService.load();
    this.cart = await this.getCart();
    this.order = await this.getOrder();
    this.user = await this.auth.getUser();
    this.loadingService.hide();
  }

  getCart(): Promise<Cart> {
    return this.db.doc$(`cart/${this.id}`).pipe(take(1)).toPromise();
  }

  //주문내역 가져오기
  getOrder(): Promise<Order> {
    return this.db
      .collection$('order', (ref) =>
        ref.where('cartIds', 'array-contains', this.id)
      )
      .pipe(
        map((datas) => {
          if (datas) {
            return datas[0];
          } else {
            return [];
          }
        })
      )
      .pipe(take(1))
      .toPromise();
  }

  back() {
    this.navc.navigateRoot('/shop/order-list', {
      animated: true,
      animationDirection: 'back',
    });
  }
  goOrderList() {
    this.navc.navigateRoot(['/shop/order-list'], {
      animated: true,
      animationDirection: 'forward',
    });
  }
}
