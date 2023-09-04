import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, NavController } from '@ionic/angular';
import { IonInfiniteScroll } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { exhibition } from 'src/app/classes/exhibition';
import { User } from 'src/app/models/user.models';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.page.html',
  styleUrls: ['./event-list.page.scss'],
})
export class EventListPage implements OnInit {
  @ViewChild('content') content: IonContent;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  exhibitions: Array<exhibition> = [];
  lastIndex: number = 8;
  currentUser: any;
  user$: Observable<User>;
  constructor(
    private navc: NavController,
    private db: DbService,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    this.user$ = this.auth.user$;
    this.exhibitions = await this.getExhibition();
  }

  async ionViewWillEnter() {
    this.currentUser = await this.auth.getUser();
  }

  //기획전 데이터 가져오기
  getExhibition(): Promise<any> {
    const today = firebase.default.firestore.Timestamp.fromDate(
      new Date(new Date().setHours(0, 0, 0, 0))
    );
    return this.db
      .collection$('exhibition', (ref) => ref.where('endDate', '>', today))
      .pipe(
        map((exhibitions) => {
          exhibitions.sort((a, b) => {
            return b.startDate * 1000 - a.startDate * 1000; // 시작일 기준 최신순 정렬
          });

          exhibitions.map((element) => {
            element.startDate = element.startDate.toDate();
            element.endDate = element.endDate.toDate();
            return element;
          });
          return exhibitions;
        })
      )
      .pipe(take(1))
      .toPromise();
  }

  top() {
    setTimeout(() => {
      this.content.scrollToPoint(0, 0, 500);
    }, 200);
  }

  //기획전 상세로 이동
  goDetail(item) {
    this.navc.navigateForward(['/shop/event-detail'], {
      queryParams: { id: item.id },
    });
  }

  //검색으로 이동
  goSearch() {
    this.navc.navigateForward(['/shop/search']);
  }

  //장바구니로 이동
  goBasket() {
    this.navc.navigateForward(['/shop/basket']);
  }

  onScroll($event) {
    let scrollTop = $event.detail.scrollTop;

    if (scrollTop <= 150) {
      document.getElementById('scroll3').classList.remove('active');
    } else {
      document.getElementById('scroll3').classList.add('active');
    }
  }

  //인피니트 스크롤 16개씩
  loadData(event) {
    setTimeout(() => {
      this.lastIndex += 8;
      event.target.complete();
      if (this.exhibitions.length <= this.lastIndex) {
        event.target.disabled = true;
      }
    }, 500);
  }
}
