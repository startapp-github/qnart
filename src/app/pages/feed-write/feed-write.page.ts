/** @format */

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  IonSlides,
  IonTextarea,
  ModalController,
  PickerController,
  Platform,
} from '@ionic/angular';
import { Post } from 'src/app/models/post.model';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { DbService } from 'src/app/services/db.service';
import { FeedService } from 'src/app/services/feed.service';
import { ImageService } from 'src/app/services/image.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-feed-write',
  templateUrl: './feed-write.page.html',
  styleUrls: ['./feed-write.page.scss'],
})
export class FeedWritePage implements OnInit {
  @Input() post;
  @ViewChild('slides2') slides2: IonSlides;
  resultSelect = '게시판 선택';

  slideOpts2 = {
    speed: 400,
    zoom: false,
    spaceBetween: 8,
    slidesPerView: 2.2,
    initialSlide: 0,
    loop: false,
  };

  newPost: Post = {
    title: '',
    text: '',
    images: [],
    dateCreated: '',
    createdBy: '',
    checkedUsers: [],
    likedUsers: [],
    isDeleted: false,
    categoryId: '',
    checkUserNumber: 0,
    recommendPoint: 0,
    isDisplay: true,
  };
  modify = false;
  uploadingImage = [];

  constructor(
    private pickerCtrl: PickerController,
    private alert: AlertService,
    private modalCtrl: ModalController,
    public dataService: DataService,
    private imageService: ImageService,
    private platform: Platform,
    private db: DbService,
    private feedSerivce: FeedService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.isDesktop();
    if (this.post) {
      this.modify = true;
      this.newPost = this.post.data;
      const selectCategory = this.dataService.categories.find(
        (item) => item.id == this.newPost.categoryId
      );
      this.resultSelect = selectCategory.name;
    }
  }

  public isDesktop() {
    if (this.platform.is('android')) {
      console.log('running on Android device!');
    }
    if (this.platform.is('ios')) {
      console.log('running on iOS device!');
    }
    if (this.platform.is('mobileweb')) {
      console.log('running in a browser on mobile!');
    }
  }

  ionViewWillEnter() {
    if (this.slides2) {
      this.slides2.update();
    }
  }

  async openPicker() {
    let categiresOption = this.dataService.categories.map((item) => {
      return { text: item.name, value: item.id };
    });
    const picker = await this.pickerCtrl.create({
      cssClass: 'picker',
      columns: [
        {
          name: 'select',
          options: categiresOption,
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
            this.resultSelect = result.select.text;
            this.newPost.categoryId = result.select.value;
          },
        },
      ],
    });

    await picker.present();
  }

  onsave() {
    const text = this.modify
      ? '게시물이 저장되었습니다'
      : '게시물이 등록되었습니다';
    this.modalCtrl.dismiss();
    // 게시물 등록
    this.alert.presentToast(text, 'toast', 1000);
  }

  // 모달 닫기
  modalCancel() {
    const text = this.modify
      ? `내용이 저장되지 않습니다.\n수정을 종료하시겠습니까?`
      : `내용이 저장되지 않습니다.\n글쓰기를 종료하시겠습니까?`;
    this.alert.cancelOkBtn('alert confirm', text).then((ok) => {
      if (ok) {
        this.modalCtrl.dismiss();
      }
    });
  }

  deleteImage(type, index: number) {
    if (type == 'image') {
      this.newPost.images.splice(index, 1);
    } else {
      this.uploadingImage.splice(index, 1);
    }
  }

  // 포커스
  setfocus(textarea: IonTextarea) {
    textarea.setFocus();
  }

  imageFromCamera() {
    if (this.uploadingImage.length + this.newPost.images.length == 10) {
      return this.alert.cancelOkBtn(
        'alert confirm',
        `이미지는 최대 10장까지만 등록할 수 있습니다.`
      );
    }
    this.imageService.getCamera('post').then((url) => {
      if (url && this.uploadingImage.length + this.newPost.images.length < 10) {
        this.uploadingImage.push(url);
      }
    });
  }

  imageFromGalley() {
    if (this.uploadingImage.length + this.newPost.images.length == 10) {
      return this.alert.cancelOkBtn(
        'alert confirm',
        `이미지는 최대 10장까지만 등록할 수 있습니다.`
      );
    }
    this.imageService.getGallery('post').then((url) => {
      if (url && this.uploadingImage.length + this.newPost.images.length < 10) {
        this.uploadingImage.push(url);
      }
    });
  }

  //작성하기 버튼 눌렀을 때
  submit() {
    let text = this.modify
      ? '수정사항을 저장하시겠습니까?'
      : '작성하신 내용으로<br> 피드를 등록하시겠습니까?';
    this.alert
      .cancelOkBtn('alert confirm', text, '', '취소', '확인')
      .then(async (ok) => {
        if (ok) {
          this.loadingService.load();
          const uploadingPromise = this.uploadingImage.map((url) => {
            return this.imageService.uploadToStorage(url, 'post');
          });
          let uploadedImages = await Promise.all(uploadingPromise);
          if (!this.modify) {
            this.newPost.id = await this.db.createFsId();
            this.newPost.dateCreated = new Date().toISOString();
            this.newPost.createdBy = localStorage.getItem('userId');
            let updateData = { ...this.newPost };
            updateData.images = uploadedImages;
            await this.db.updateAt(`posts/${updateData.id}`, updateData);
            this.feedSerivce.reinIt();
          } else {
            let updateData = { ...this.newPost };
            updateData.images = [...updateData.images, ...uploadedImages];
            this.post.data = updateData;
            await this.db.updateAt(`posts/${updateData.id}`, updateData);
            this.feedSerivce.updateFeed(this.post);
          }
          this.loadingService.hide();
          this.onsave();
        }
      });
  }
}
