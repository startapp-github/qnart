import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, NavController } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { map, take } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  @ViewChild('content') content: IonContent;
  heart: boolean;
  beforeSearch: boolean = true;
  searchList;
  contents;
  title: string;
  filterContents;
  filter: string = '최신순';
  currentUser: any;
  lastIndex: number = 16;

  //최근검색어 저장
  searchKeyword = {
    keyword: '',
    dateCreated: new Date().toISOString(),
  };
  searchKeywords: any[] = [];
  constructor(
    private navc: NavController,
    public loading: LoadingService,
    private db: DbService,
    private alertService: AlertService,
    private auth: AuthService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.filterContents = null;
    this.beforeSearch = true;
    // this.searchKeyword.keyword = '';
    this.currentUser = await this.auth.getUser();
    console.log('this.currentUser', this.currentUser);

    this.recentlySearchKeywords();
    this.contents = await this.getData();
  }

  ionViewWillLeave() {
    this.searchKeyword.keyword = '';
  }

  //상품 가져오기
  getData() {
    return this.db
      .collection$(`product`, (ref) =>
        ref
          .orderBy('dateCreated', 'desc')
          .where('deleteSwitch', '==', false)
          .where('showSwitch', '==', true)
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
          return data;
        })
      )
      .pipe(take(1))
      .toPromise();
  }

  // 최근검색어 클릭시
  searchRecently(item: any) {
    this.searchKeyword.keyword = item;
    this.searchFilter(item);
  }

  recentlySearchKeywords() {
    if (!this.currentUser) {
      let arr = localStorage.getItem('keywords');

      if (arr == 'null' || arr == null) {
        this.searchKeywords = [];
        // localStorage.setItem('keywords', JSON.stringify(this.searchKeywords));
      } else {
        this.searchKeywords = JSON.parse(arr);
      }
    } else {
      this.searchKeywords = this.currentUser.recentKeyword;
    }

    if (this.searchKeywords && this.searchKeywords.length > 0) {
      this.searchKeywords.sort((a, b) => {
        const aDate = new Date(a.dateCreated).getTime();
        const Bdate = new Date(b.dateCreated).getTime();

        return Bdate - aDate;
      });
    }
  }

  search(ev: KeyboardEvent) {
    if ((ev as KeyboardEvent).keyCode === 13) {
      setTimeout(() => {
        if (this.searchKeyword.keyword) {
          const keywordObj = { ...this.searchKeyword };
          if (this.searchKeywords) {
            if (this.searchKeywords.length < 10) {
              if (!this.currentUser) {
                const str = JSON.stringify(this.searchKeyword);

                console.log('!this.searchKeywords', this.searchKeywords);
                const recentKeys = this.searchKeywords.map(
                  (keyword) => keyword.keyword
                );

                console.log({ recentKeys });

                if (
                  this.searchKeywords.length > 0 &&
                  !recentKeys.includes(this.searchKeyword.keyword)
                ) {
                  console.log('?');

                  this.searchKeywords.unshift(JSON.parse(str));
                  localStorage.setItem(
                    'keywords',
                    JSON.stringify(this.searchKeywords)
                  );
                } else if (
                  !this.searchKeyword ||
                  this.searchKeywords.length == 0
                ) {
                  console.log('??');
                  this.searchKeywords.unshift(JSON.parse(str));
                  localStorage.setItem(
                    'keywords',
                    JSON.stringify(this.searchKeywords)
                  );
                }
              } else {
                this.searchKeywords.unshift(keywordObj);
                this.db.updateAt(`users/${this.currentUser.uid}`, {
                  recentKeyword:
                    firebase.default.firestore.FieldValue.arrayUnion(
                      keywordObj
                    ),
                });
              }

              this.searchFilter(this.searchKeyword.keyword);
            } else {
              this.searchKeywords.pop();

              if (!this.currentUser) {
                const recentKeys = this.searchKeywords.map(
                  (keyword) => keyword.keyword
                );

                const str = JSON.stringify(this.searchKeyword);

                if (
                  this.searchKeywords.length > 0 &&
                  !recentKeys.includes(this.searchKeyword.keyword)
                ) {
                  this.searchKeywords.unshift(JSON.parse(str));
                  localStorage.setItem(
                    'keywords',
                    JSON.stringify(this.searchKeywords)
                  );
                } else if (
                  !this.searchKeyword ||
                  this.searchKeywords.length == 0
                ) {
                  this.searchKeywords.unshift(JSON.parse(str));
                  localStorage.setItem(
                    'keywords',
                    JSON.stringify(this.searchKeywords)
                  );
                }
              } else {
                this.searchKeywords.unshift(keywordObj);
                this.db.updateAt(`users/${this.currentUser.uid}`, {
                  recentKeyword: keywordObj,
                });
              }

              this.searchFilter(this.searchKeyword.keyword);
            }
          } else {
            if (!this.currentUser) {
              const recentKeys = this.searchKeywords.map(
                (keyword) => keyword.keyword
              );

              const str = JSON.stringify(this.searchKeyword);

              if (
                this.searchKeywords.length > 0 &&
                !recentKeys.includes(this.searchKeyword.keyword)
              ) {
                this.searchKeywords.unshift(JSON.parse(str));
                localStorage.setItem(
                  'keywords',
                  JSON.stringify(this.searchKeywords)
                );
              } else if (
                !this.searchKeyword ||
                this.searchKeywords.length == 0
              ) {
                this.searchKeywords.unshift(JSON.parse(str));
                localStorage.setItem(
                  'keywords',
                  JSON.stringify(this.searchKeywords)
                );
              }
              // this.searchKeywords.unshift(JSON.parse(str));
              // localStorage.setItem(
              //   'keywords',
              //   JSON.stringify(this.searchKeywords)
              // );
            } else {
              console.log('this.searchKeywords', this.searchKeywords);

              this.searchKeywords.unshift(keywordObj);
              this.db.updateAt(`users/${this.currentUser.uid}`, {
                recentKeyword:
                  firebase.default.firestore.FieldValue.arrayUnion(keywordObj),
              });
            }
          }
        }
      }, 0);
    }
  }

  //검색 필터
  async searchFilter(item: any) {
    console.log({ item });

    await this.loading.load();
    this.beforeSearch = false;
    this.title = item;
    const product = this.contents;
    const lowerItem = item.toLowerCase();
    const filter = product.filter((ele) => {
      return (
        ele.productName.includes(lowerItem) || ele.infoText.includes(lowerItem)
      );
    });

    this.filterContents = filter;

    this.loading.hide();
  }

  //최신순 필터
  filterChange() {
    const items = this.filterContents.sort((a, b) => {
      return (
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      );
    });

    switch (this.filter) {
      case '최신순':
        this.filterContents = items.sort((a, b) => {
          return (
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime()
          );
        });
        break;
      case '낮은가격순':
        this.filterContents = items.sort((a, b) => {
          const priceA = a.discountPrice ? a.discountPrice : a.price;
          const priceB = b.discountPrice ? b.discountPrice : b.price;

          return priceA - priceB;
        });
        break;
      case '높은가격순':
        this.filterContents = items.sort((a, b) => {
          const priceA = a.discountPrice ? a.discountPrice : a.price;
          const priceB = b.discountPrice ? b.discountPrice : b.price;

          return priceB - priceA;
        });
        break;
      case '판매량순':
        this.filterContents = items.sort((a, b) => {
          return b.salesCount - a.salesCount;
        });
        break;

      default:
        break;
    }
  }

  //삭제
  removeTag(index: number) {
    if (!this.currentUser) {
      this.searchKeywords.splice(index, 1);
      localStorage.setItem('keywords', JSON.stringify(this.searchKeywords));
    } else {
      const tmp = this.searchKeywords.splice(index, 1)[0];
      this.db.updateAt(`users/${this.currentUser.uid}`, {
        recentKeyword: firebase.default.firestore.FieldValue.arrayRemove(tmp),
      });
    }
  }

  //전체삭제
  removeAllAlert() {
    this.alertService
      .okCancelBtn(
        'present-alert',
        '최근 검색어를 모두 삭제 하시겠습니까?',
        '전체삭제',
        '확인',
        '취소'
      )
      .then((ok) => {
        if (ok) {
          if (!this.currentUser) {
            this.searchKeywords = [];
            localStorage.setItem(
              'keywords',
              JSON.stringify(this.searchKeywords)
            );
          } else {
            this.db
              .updateAt(`users/${this.currentUser.uid}`, {
                recentKeyword: [],
              })
              .then(() => {
                this.searchKeywords = [];
              });
          }
        }
      });
  }

  onScroll($event) {
    if (!this.beforeSearch || this.searchKeyword.keyword) {
      let scrollTop = $event.detail.scrollTop;

      if (scrollTop <= 150) {
        if (document.getElementById('scroll10').classList.contains('active')) {
          document.getElementById('scroll10').classList.remove('active');
        }
      } else {
        document.getElementById('scroll10').classList.add('active');
      }
    }
  }

  loadData(event) {
    setTimeout(() => {
      this.lastIndex += 16;
      event.target.complete();
      if (this.filterContents.length <= this.lastIndex) {
        event.target.disabled = true;
      }
    }, 500);
  }

  top() {
    setTimeout(() => {
      this.content.scrollToPoint(0, 0, 500);
    }, 200);
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
            this.pick();
          });
      }
    } else {
      this.alertService.noneUser();
    }
  }

  pick() {
    this.alertService.toast('찜한상품 목록에 추가했습니다.', 'toast');
  }

  dePickToast() {
    this.alertService.toast('찜한상품 목록에서 삭제했습니다.', 'toast');
  }

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

  //상품상세
  goItemDetail(item) {
    this.navc.navigateForward(['/product-detail'], {
      queryParams: { id: item.id },
    });
  }

  checkKeyword() {
    if (!this.beforeSearch) {
      if (!this.searchKeyword.keyword) {
        this.beforeSearch = true;
      }
    }
  }
}
