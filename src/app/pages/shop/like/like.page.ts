import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, NavController } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { map, take } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-like',
  templateUrl: './like.page.html',
  styleUrls: ['./like.page.scss'],
})
export class LikePage implements OnInit {
  @ViewChild('content') content: IonContent;

  heart: boolean;
  currentUser: any;
  products;

  constructor(
    private auth: AuthService,
    private navc: NavController,
    private db: DbService,
    private alertService: AlertService
  ) {}

  async ngOnInit() {
    this.currentUser = await this.auth.getUser();
    this.products = await this.getProduct();
  }

  //찜한 상품 가져오기
  getProduct() {
    return this.db
      .collection$('product', (ref) =>
        ref
          .where('deleteSwitch', '==', false)
          .orderBy('dateCreated', 'desc')
          .where('showSwitch', '==', true)
      )
      .pipe(
        map((products: any) => {
          return products.filter((ele) =>
            ele.heartList.includes(this.currentUser.uid)
          );
        })
      )
      .pipe(
        map((data: any) => {
          const uid = this.currentUser ? this.currentUser.uid : '';
          data.forEach((element) => {
            if (element.heartList.includes(uid)) {
              element['heart'] = true;
            } else {
              element['heart'] = false;
            }
          });

          this.products = data;
          return data;
        })
      )
      .pipe(take(1))
      .toPromise();
  }

  onScroll($event) {
    let scrollTop = $event.detail.scrollTop;

    if (scrollTop <= 150) {
      document.getElementById('scroll5').classList.remove('active');
    } else {
      document.getElementById('scroll5').classList.add('active');
    }
  }

  top() {
    setTimeout(() => {
      this.content.scrollToPoint(0, 0, 500);
    }, 200);
  }

  //좋아요
  async like(item, i) {
    if (this.currentUser) {
      if (item.heart) {
        this.DeletePick(item, i);
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

  //찜
  Pick() {
    this.alertService.toast('찜한상품 목록에 추가했습니다.', 'toast');
  }

  //찜 삭제 토스트
  dePickToast() {
    this.alertService.toast('찜한상품 목록에서 삭제했습니다.', 'toast');
  }

  //찜 삭제
  DeletePick(item, i) {
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
              this.products.splice(i, 1);
            });
        }
      });
  }

  //상품 상세
  goItemDetail(item) {
    this.navc.navigateForward(['/shop/product-detail'], {
      queryParams: { id: item.id },
    });
  }

  //인기상품
  goItem() {
    this.navc.navigateForward(['/shop/popular']);
  }
}
