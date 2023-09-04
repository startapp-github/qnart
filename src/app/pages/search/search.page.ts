/** @format */

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavController, PickerController } from '@ionic/angular';
import { Post } from 'src/app/models/post.model';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  resultSelect = '최신순';
  postList: Post[];
  searchText: string;
  searchTerm;
  recentSearch: string[] = [];
  text;
  constructor(
    private alert: AlertService,
    private pickerCtrl: PickerController,
    public navCtrl: NavController,
    public dataService: DataService,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    setTimeout(() => {
      this.inToast();
    }, 300);
    this.recentSearch = JSON.parse(localStorage.getItem('recentSearch'))
      ? JSON.parse(localStorage.getItem('recentSearch'))
      : [];
  }

  async ionViewWillEnter() {
    this.postList = await this.dataService.getAllPosts();
  }

  handleChange(event) {
    if (event.detail.value) {
      this.searchText = event.detail.value;
      this.setRecentSearch(this.searchText);
    } else {
      this.searchText = '';
    }
  }

  selectText(text) {
    this.searchText = text;
    this.text = text;
  }

  setRecentSearch(text) {
    const find = this.recentSearch.find((item) => item == text);
    if (!find) {
      this.recentSearch.unshift(text);
      this.recentSearch.splice(9, this.recentSearch.length);
      localStorage.setItem('recentSearch', JSON.stringify(this.recentSearch));
    }
  }

  deleteAllRecent() {
    this.recentSearch = [];
    localStorage.setItem('recentSearch', JSON.stringify(this.recentSearch));
  }

  deleteSearchKeyword(i) {
    this.recentSearch.splice(i, 1);
    localStorage.setItem('recentSearch', JSON.stringify(this.recentSearch));
  }

  checkClass(post) {
    switch (post.images.length) {
      case 0:
        return 'paragraph';
      case 1:
        return 'default';
      default:
        return 'pic';
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
          },
        },
      ],
    });

    await picker.present();
  }

  async feedDetail(item) {
    const postData = await this.dataService.getFeedTypePostByPostId(item.id);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        post: JSON.stringify(postData),
        type: 'detail',
      },
    };
    this.navCtrl.navigateForward(['/feed-detail'], navigationExtras);
  }

  // 진입 토스트
  inToast() {
    this.alert.presentToast('검색어를 입력해 주세요.', 'toast', 500);
  }
}
