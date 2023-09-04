import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, NavController } from '@ionic/angular';
import { IonInfiniteScroll } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ArrayJoin, DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.page.html',
  styleUrls: ['./event-detail.page.scss'],
})
export class EventDetailPage implements OnInit {
  @ViewChild('content') content: IonContent;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  heart: boolean;
  exhibitionId: string = '';
  exhibitions;
  currentUser: any;
  lastIndex: number = 16;
  exhibition$: Observable<any>;

  constructor(
    private navc: NavController,
    private route: ActivatedRoute,
    private db: DbService,
    private auth: AuthService,
    private alertService: AlertService
  ) {
    this.exhibitionId = this.route.snapshot.queryParams.id;
  }

  async ngOnInit() {
    this.currentUser = await this.auth.getUser();
    this.getExhibition();
  }

  //기획전 상세 상품 엮어서 가져오기
  getExhibition() {
    this.exhibition$ = this.db
      .doc$(`exhibition/${this.exhibitionId}`)
      .pipe(ArrayJoin(this.db.afs, 'productList', 'product'))
      .pipe(
        map((data: any) => {
          const uid = this.currentUser ? this.currentUser.uid : '';

          const product = data.productList.filter(
            (ele) => !ele.deleteSwitch && ele.showSwitch
          );

          product.map((element) => {
            if (element.heartList.includes(uid)) {
              element['heart'] = true;
            } else {
              element['heart'] = false;
            }
          });

          data['productList'] = product;

          return data;
        })
      );
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
  async Pick() {
    this.alertService.toast('찜한상품 목록에 추가했습니다.', 'toast');
  }

  //좋아요 삭세 토스트
  async dePickToast() {
    this.alertService.toast('찜한상품 목록에서 삭제했습니다.', 'toast');
  }

  //좋아요 삭제 알럿
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

  //탑으로 이동
  top() {
    setTimeout(() => {
      this.content.scrollToPoint(0, 0, 500);
    }, 200);
  }

  //상품 상세로 이동
  goItemDetail(item) {
    this.navc.navigateForward(['/shop/product-detail'], {
      queryParams: { id: item.id },
    });
  }

  onScroll($event) {
    let scrollTop = $event.detail.scrollTop;

    if (scrollTop <= 150) {
      document.getElementById('scroll4').classList.remove('active');
    } else {
      document.getElementById('scroll4').classList.add('active');
    }
  }

  //인피니트 스크롤 16개씩
  loadData(event) {
    setTimeout(() => {
      this.lastIndex += 16;
      event.target.complete();
      if (this.exhibitions.productList.length <= this.lastIndex) {
        event.target.disabled = true;
      }
    }, 500);
  }
}
