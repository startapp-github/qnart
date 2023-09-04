import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Cart } from 'src/app/models/cart';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-redund-detail-cart',
  templateUrl: './redund-detail-cart.page.html',
  styleUrls: ['./redund-detail-cart.page.scss'],
})
export class RedundDetailCartPage implements OnInit {
  id: string;
  cart: Cart;
  deliveryCharge: number = 2500; //일단 고정 값
  constructor(private route: ActivatedRoute, private db: DbService) {
    this.id = this.route.snapshot.queryParams.id;
  }

  async ngOnInit() {
    this.cart = await this.getCart();
  }

  //장바구니 가져오기
  getCart(): Promise<any> {
    return this.db.doc$(`cart/${this.id}`).pipe(take(1)).toPromise();
  }
}
