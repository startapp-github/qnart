/** @format */

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActionSheetController, NavController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { User } from 'src/app/models/user.models';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { ImageService } from 'src/app/services/image.service';
import { UserService } from 'src/app/services/user.service';
import { Validator } from 'src/validator';

@Component({
  selector: 'app-profile-set',
  templateUrl: './profile-set.page.html',
  styleUrls: ['./profile-set.page.scss'],
})
export class ProfileSetPage implements OnInit {
  userData: User;
  nickNameAvailable: boolean = true;
  nickNameForm: FormGroup;
  uploadImage: string;
  deleteSwitch = false;

  constructor(
    public userService: UserService,
    private actionsheetCtrl: ActionSheetController,
    public navCtrl: NavController,
    private alert: AlertService,
    private dataService: DataService,
    public formBuilder: FormBuilder,
    private imageService: ImageService
  ) {
    this.nickNameForm = formBuilder.group(
      {
        nickName: Validator.nicknameValidator,
      },
      {}
    );
  }

  async ngOnInit() {
    await this.userService.inIt();
    this.userData = this.userService.userData;
    this.nickNameForm.controls.nickName.setValue(this.userData.nickName);
  }

  async ionViewWillEnter() {
    await this.userService.reInit();
    this.userData = this.userService.userData;
  }

  async picActionsheet() {
    const actionSheet = await this.actionsheetCtrl.create({
      cssClass: 'actionsheet',
      buttons: [
        {
          text: '앨범에서 선택',
          role: 'destructive',
          handler: () => {
            console.log('앨범에서 선택');
            this.imageService.getGallery('profile').then((url) => {
              this.deleteSwitch = false;
              this.uploadImage = url;
            });
          },
        },
        {
          text: '프로필 사진 삭제',
          handler: () => {
            console.log('프로필 사진 삭제');
            this.deleteSwitch = true;
            this.uploadImage = 'assets/imgs/avatar.png';
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

  checkNickname() {
    this.dataService
      .checkUsername(this.nickNameForm.controls.nickName.value)
      .pipe(take(1))
      .subscribe((nickname) => {
        console.log('nickname', nickname);
        this.nickNameAvailable = nickname.length > 0 ? false : true;
        if (nickname.length) {
          this.duplicateNicknameAlert();
        } else {
          this.useNicknameAlert();
        }
      });
  }

  // 닉네임 중복 Alert
  duplicateNicknameAlert() {
    this.alert.okBtn('alert', `중복된 닉네임입니다.`);
  }

  // 닉네임 사용가능 Alert
  useNicknameAlert() {
    this.alert.okBtn('alert', `사용 가능한 닉네임입니다.`);
  }

  async passwordChangeBtn() {
    this.userData.nickName = this.nickNameForm.controls.nickName.value;
    if (this.deleteSwitch) {
      this.userData.profileImage = 'assets/imgs/avatar.png';
    } else {
      if (this.uploadImage) {
        this.userData.profileImage = await this.imageService.uploadToStorage(
          this.uploadImage,
          'profile'
        );
        console.log('this.userData.profileImage', this.userData.profileImage);
      }
    }
    await this.userService.updateUserData(this.userData);
    this.navCtrl.back();
    this.alert.presentToast('프로필 정보가 변경되었습니다.', 'toast', 1000);
  }

  //주소등록 이동
  goAddress() {
    this.navCtrl.navigateForward(['/shop/myinfo-address']);
  }
}
