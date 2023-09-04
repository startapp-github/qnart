/** @format */

import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonContent,
  IonInfiniteScroll,
  ModalController,
  NavController,
  PickerController,
} from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';
import { FeedService, Item } from 'src/app/services/feed.service';
import { filter, take } from 'rxjs/operators';
import { NavigationExtras } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { FeedWritePage } from '../feed-write/feed-write.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  animations: [
    trigger('myAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(0)', opacity: 0 }),
        animate('300ms', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
    ]),
  ],
})
export class HomePage implements OnInit {
  @ViewChild('content') content: IonContent;
  @ViewChild(IonInfiniteScroll, { static: false })
  infiniteScroll: IonInfiniteScroll;
  items$: Observable<Item[]>;
  loaded = false;

  private lastPageReachedSub: Subscription;
  private loadingSub: Subscription;

  result: Array<string> = ['최신순', '추천순', '조회수순'];
  resultSelect = '최신순';

  constructor(
    private pickerCtrl: PickerController,
    public navCtrl: NavController,
    public dataService: DataService,
    private userService: UserService,
    private feedService: FeedService,
    private alertService: AlertService,
    private modalCtrl: ModalController
  ) {}
  async ngOnInit() {
    await this.dataService.inIt();
    await this.userService.inIt();
    this.items$ = this.feedService.watchItems();

    this.lastPageReachedSub = this.feedService
      .watchLastPageReached()
      .subscribe((reached: boolean) => {
        if (reached && this.infiniteScroll) {
          this.infiniteScroll.disabled = true;
          this.alertService.presentToast(
            '게시물을 모두 가져왔습니다.',
            'toast',
            1000
          );
        } else {
          this.infiniteScroll.disabled = false;
        }
      });
    this.loadingSub = this.feedService.watchLoading().subscribe((loading) => {
      this.loaded = loading;
    });
    this.userService.watchUserData().subscribe((userdata) => {
      this.feedService.reinIt(this.resultSelect);
    });
    this.feedService
      .watchItems()
      .pipe(
        filter((flats) => flats !== undefined),
        take(1)
      )
      .subscribe((_items: Item[]) => {
        console.log('_items', _items);

        this.loaded = true;
      });
  }

  handleRefresh(event) {
    this.feedService.reinIt();
    setTimeout(() => {
      // Any calls to load data go here
      this.loaded = true;
      event.target.complete();
    }, 1000);
  }

  async findNext($event) {
    await this.feedService.find();
    setTimeout(async () => {
      $event.target.complete();
    }, 500);
  }

  ionViewWillEnter() {
    this.content.scrollToTop();
  }

  // 좋아요버튼
  likeToggle(post) {
    const findLike = post.data.likedUsers.find(
      (item) => item == this.dataService.userId
    );
    if (!findLike) {
      post.data.likedUsers = [...post.data.likedUsers, this.dataService.userId];
      this.feedService.updateFeed(post);
      this.dataService.addLikedPost(post.id);
      this.alertService.presentToast(
        '좋아요한 글에 저장되었습니다',
        'toast',
        1000
      );
    } else {
      post.data.likedUsers = post.data.likedUsers.filter(
        (userId) => userId != this.dataService.userId
      );
      this.feedService.updateFeed(post);
      this.dataService.addLikedPost(post.id);
      this.alertService.presentToast(
        '좋아요한 글에서 제거되었습니다',
        'toast',
        1000
      );
    }
    // if (this.likeClicked) {
    //   this.alert.presentToast('좋아요한 글에 저장되었습니다', 'toast', 1000);
    // } else {
    //   this.alert.presentToast('좋아요한 글에서 제거되었습니다', 'toast', 1000);
    // }
  }

  checkLike(post) {
    const findLike = post.data.likedUsers.find(
      (item) => item == this.dataService.userId
    );
    if (findLike) {
      return true;
    } else {
      return false;
    }
  }

  async openPicker() {
    const picker = await this.pickerCtrl.create({
      cssClass: 'picker',
      columns: [
        {
          name: 'select',
          options: [
            { text: '최신순', value: '최신순' },
            { text: '추천순', value: '추천순' },
            { text: '조회수순', value: '조회수순' },
          ],
        },
      ],
      buttons: [
        {
          text: '취소',
          role: 'cancel',
          cssClass: 'picker-cancel',
        },
        {
          text: '확인',
          cssClass: 'picker-done',
          handler: (result) => {
            console.log(result.select.text);
            this.resultSelect = result.select.value;
            this.feedService.reinIt(this.resultSelect);
          },
        },
      ],
    });

    await picker.present();
  }

  trackById(idx, post) {
    return post.id;
  }

  // 검색
  goSearch() {
    this.navCtrl.navigateForward(['/search']);
  }

  // 개시물 상세
  goPostDetail(item: Item) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        post: JSON.stringify(item),
        type: 'home',
      },
    };
    this.navCtrl.navigateForward(['/feed-detail'], navigationExtras);
  }

  // 관심주제설정
  goSubject() {
    this.navCtrl.navigateForward(['/my-subject']);
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');

    if (this.lastPageReachedSub) {
      this.lastPageReachedSub.unsubscribe();
    }
    if (this.loadingSub) {
      this.loadingSub.unsubscribe();
    }
  }

  // 게시물작성
  async feedWrite() {
    if (this.userService.userData) {
      const modal = await this.modalCtrl.create({
        component: FeedWritePage,
      });
      await modal.present();
    } else {
      this.alertService.noneUser();
    }
  }
}
