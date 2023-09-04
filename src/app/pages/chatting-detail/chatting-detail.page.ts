/** @format */

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ActionSheetController,
  IonContent,
  ModalController,
  NavController,
  Platform,
} from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Chat, ChatList } from 'src/app/models/chat.model';
import { User } from 'src/app/models/user.models';
import { AlertService } from 'src/app/services/alert.service';
import { ChatService } from 'src/app/services/chat.service';
import { CommonService } from 'src/app/services/common.service';
import { DbService } from 'src/app/services/db.service';
import { ImageService } from 'src/app/services/image.service';
import { LoadingService } from 'src/app/services/loading.service';
import { PushService } from 'src/app/services/push.service';
import { UserService } from 'src/app/services/user.service';
import { ImageModalPage } from '../image-modal/image-modal.page';

@Component({
  selector: 'app-chatting-detail',
  templateUrl: './chatting-detail.page.html',
  styleUrls: ['./chatting-detail.page.scss'],
})
export class ChattingDetailPage implements OnInit {
  @ViewChild(IonContent, { static: true }) content: IonContent;

  @ViewChild('container') container: IonContent;
  @ViewChild('sendInput', { static: false }) sendInput: {
    setFocus: () => void;
  };
  @ViewChild('hiddenInput', { static: false }) hiddenInput: {
    setFocus: () => void;
  };

  slideOpts2 = {
    speed: 400,
    zoom: false,
    spaceBetween: 8,
    // slidesPerView: 2.2,
    initialSlide: 0,
    loop: false,
  };
  buttonsItem = false;
  uploadingImage = [];
  gallery = false;
  partner: User;
  text;

  chatId: string;

  chat$: Observable<Chat>;

  user;

  startIndex;
  lastIndex;

  pauseSwitch: boolean = false;
  chat: Chat;

  constructor(
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private alertService: AlertService,
    private modalController: ModalController,
    private route: ActivatedRoute,
    private userService: UserService,
    private cs: ChatService,
    public common: CommonService,
    private db: DbService,
    private platform: Platform,
    private push: PushService,
    private imageService: ImageService,
    private load: LoadingService
  ) {
    window.addEventListener('ionKeyboardDidShow', (ev) => {
      this.content.scrollToBottom(10);
    });

    this.platform.pause.subscribe((e) => {
      console.log('pause', e);
      this.pauseSwitch = true;
    });
    this.platform.resume.subscribe((e) => {
      console.log('resume', e);
      this.pauseSwitch = false;
      this.setReadIndex(this.chat);
    });
  }
  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      await this.userService.inIt();
      this.chatId = params.id;
      this.getData();
    });
  }

  toggleChecked() {
    this.buttonsItem = !this.buttonsItem;
  }

  alertSwitch = false;

  async getData() {
    await this.load.load();
    this.user = this.userService.userData;
    if (this.user && this.user.dateCreated) {
      this.chat$ = this.cs.getChat(this.chatId).pipe(
        map((chat: Chat) => {
          this.user = this.userService.userData;
          let uid = this.userService.userData.id;

          this.lastIndex = chat.messages ? chat.messages.length : 0;
          this.partner = chat.partner;
          this.chat = chat;
          this.startIndex = chat[uid].startIndex;
          // if (this.startIndex != 0 && this.startIndex === this.lastIndex && !this.alertSwitch) {
          //   this.alertSwitch = true;
          //   this.alertService.okBtn('', '삭제하신 채팅입니다.').then(() => {
          //     this.navController.pop();
          //   });
          // }
          if (this.load.isLoading) {
            this.load.hide();
          }
          this.setReadIndex(chat);
          this.scrollBottom();

          return chat;
        })
      );
    } else {
      setTimeout(() => {
        this.getData();
      }, 50);
    }
  }

  setReadIndex(chat) {
    if (this.pauseSwitch) {
      return;
    }
    if (chat[this.user.uid]['readIndex'] !== this.lastIndex) {
      this.db.updateAt(`chats/${chat.id}`, {
        [this.user.uid]: {
          readIndex: this.lastIndex,
        },
      });
    }
  }

  async sendImages() {
    const uploadingPromise = this.uploadingImage.map((url) => {
      return this.imageService.uploadToStorage(url, 'chat');
    });
    let uploadedImages = await Promise.all(uploadingPromise);
    this.cs.sendMessage(this.chatId, uploadedImages, 'img');

    if (!this.partner.blockedUsers?.includes(this.user.uid)) {
      if (
        !this.partner.exitSwitch &&
        this.partner.pushSwitch &&
        this.partner.pushId.length > 0
      ) {
        this.push
          .sendPush(
            this.partner.pushId,
            '채팅 알림',
            '새로운 채팅이 도착했어요.',
            {
              type: 'chat-matching',
              typeId: this.chatId,
            }
          )
          .then((e) => {
            console.log('push', e);
          });
      }
      this.uploadingImage = [];
      this.text = '';
    } else {
      this.uploadingImage = [];
      this.text = '';
    }
    this.scrollBottom();
  }

  submit() {
    if (this.uploadingImage.length) {
      this.sendImages();
      return;
    }
    if (!this.text) {
      return;
    }

    this.text = this.text + ' ';
    this.cs.sendMessage(this.chatId, this.text, 'text');
    this.text = '';

    this.hiddenInput.setFocus();

    setTimeout(() => {
      this.sendInput.setFocus();
    }, 50);

    // 차단당했는지 여부
    if (!this.partner.blockedUsers?.includes(this.user.uid)) {
      if (
        !this.partner.exitSwitch &&
        this.partner.pushSwitch &&
        this.partner.pushId.length > 0
      ) {
        this.push
          .sendPush(
            this.partner.pushId,
            '채팅 알림',
            '새로운 채팅이 도착했어요.',
            {
              type: 'chat-matching',
              typeId: this.chatId,
            }
          )
          .then((e) => {
            console.log('push', e);
          });
      }
    }

    this.scrollBottom();
  }

  scrollBottom(v?) {
    var that = this;
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(v || 100);
      }
    }, 0);
  }

  async imgDetail(img) {
    const modal = await this.modalController.create({
      component: ImageModalPage,
      componentProps: {
        images: img,
        index: 0,
      },
    });
    return await modal.present();
  }

  //상대방 마이페이지로 이동
  goMypage(uid) {
    this.navController.navigateForward(['/mypage'], { queryParams: { uid } });
  }

  checkClass(images) {
    switch (images.length) {
      case 10:
        return 'nth-10';
      case 9:
        return 'nth-9';
      case 8:
        return 'nth-8';
      case 7:
        return 'nth-7';
      case 6:
        return 'nth-6';
      case 5:
        return 'nth-5';
      case 4:
        return 'nth-3';
      case 3:
        return 'nth-3';
      case 2:
        return 'nth-2';
      case 1:
        return 'nth-1';
      default:
        return '';
    }
  }

  async selectImage(type) {
    let url: string;
    if (this.uploadingImage.length == 10) {
      return this.alertService.cancelOkBtn(
        'alert confirm',
        `이미지는 최대 10장까지만 등록할 수 있습니다.`
      );
    }
    switch (type) {
      case 'camera':
        url = await this.imageService.getCamera('chat');
        break;
      case 'gallery':
        url = await this.imageService.getGallery('chat');
        break;
    }

    if (!url) {
      return false;
    }
    this.uploadingImage.push(url);
    this.text = '이미지';

    // const modal = await this.modalController.create({
    //   component: ImageModalPage,
    //   componentProps: {
    //     images: [url],
    //     index: 0,
    //   },
    // });

    // await modal.present();

    // const confirm = await this.alertService.cancelOkBtn(
    //   'two-btn',
    //   '사진을 전송하시겠습니까?'
    // );

    // await modal.dismiss();

    // if (confirm) {
    //   this.cs.sendMessage(this.chatId, url, 'img');

    //   if (!this.partner.blockedUsers.includes(this.user.uid)) {
    //     if (
    //       !this.partner.exitSwitch &&
    //       this.partner.pushSwitch &&
    //       this.partner.pushId.length > 0
    //     ) {
    //       this.push
    //         .sendPush(
    //           this.partner.pushId,
    //           '채팅 알림',
    //           '새로운 채팅이 도착했어요.',
    //           { type: 'chat-matching', typeId: this.chatId }
    //         )
    //         .then(e => {
    //           console.log('push', e);
    //         });
    //     }
    //   }
    // }
  }

  deleteAlert() {
    this.alertService
      .cancelOkBtn(
        'alert confirm',
        '채팅방에서 나가시겠어요? <br> 나가기를 하면 대화내용이 모두 삭제되고 채팅 목록에서도 삭제됩니다.',
        '',
        '취소',
        '확인'
      )
      .then(async (res) => {
        if (res) {
          this.alertSwitch = true;
          // if (this.chat.messages.length === 0) {
          await this.db.updateAt(`chats/${this.chatId}`, {
            exitUsers: firebase.default.firestore.FieldValue.arrayUnion(
              this.user.uid
            ),
          });
          // } else {
          await this.cs.setStartIndex(this.chatId, this.lastIndex);
          // }
          this.alertService.toast('나가기 했습니다.', 'toast');
          this.navController.pop();
        }
      });
  }

  userBlockAlert() {
    this.alertService
      .cancelOkBtn(
        'alert confirm',
        `차단하면 서로 채팅도 보낼 수 없습니다.<br>차단하시겠습니까?`
      )
      .then((ok) => {
        if (ok) {
          this.userService.updateBlockUser(this.partner.uid);
          this.navController.back();
        }
      });
  }

  async userChatMoreSheet() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'actionsheet',
      buttons: [
        {
          text: '차단하기',
          handler: () => {
            this.userBlockAlert();
            console.log('차단하기');
          },
        },
        {
          text: '채팅방 나가기',
          handler: () => {
            this.deleteAlert();
            console.log('채팅방 나가기');
          },
        },
        {
          text: '취소',
          role: 'cancel',
          cssClass: 'sheet-cancel',
          handler: () => {
            console.log('취소');
          },
        },
      ],
    });
    await actionSheet.present();
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }

  deleteImage(index: number) {
    this.uploadingImage.splice(index, 1);
  }
}
