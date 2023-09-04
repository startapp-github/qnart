/** @format */

import { Injectable } from '@angular/core';
import { CameraOptions, Camera } from '@awesome-cordova-plugins/camera/ngx';
import * as firebase from 'firebase/compat/app';
import { CommonService } from './common.service';
import { LoadingService } from './loading.service';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings/ngx';
import { AlertService } from './alert.service';
import { environment } from 'src/environments/environment';
import { appSolutionInfo } from 'src/clientInfo/client-info';

firebase.default.initializeApp(environment.firebaseConfig['PROJECT-ONE']);

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  public cameraoption: CameraOptions = {
    quality: 60,
    allowEdit: false,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.CAMERA,
    correctOrientation: true,
    // saveToPhotoAlbum: false,
  };

  public gallery: CameraOptions = {
    quality: 60,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    correctOrientation: true,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    // correctOrientation: true,
    // saveToPhotoAlbum: false,
  };
  constructor(
    public camera: Camera,
    private loadingService: LoadingService,
    private commonService: CommonService,
    public imagePicker: ImagePicker,
    private openNativeSettings: OpenNativeSettings,
    private alertService: AlertService
  ) {}

  /**
   * camera
   * 카메라로 직접 찍은 사진을 업로드
   * @param type 이미지를 넣을 firebase 폴더 이름
   */
  async getCamera(type) {
    return new Promise<any>(async (resolve, reject) => {
      // !!!! 수정필요

      this.camera
        .getPicture(this.cameraoption)
        .then((url: any) => {
          let imageurl = 'data:image/jpeg;base64,' + url;

          // this.uploadToStorage(url, type).then(async (uploaledUrl: any) => {
          resolve(imageurl);
          // });
        })
        .catch((err) => {
          console.log('err', err);
          reject(err);
        });
    });
  }

  getResizeUrl(url) {
    const bucket = appSolutionInfo.storageBucket;
    const storageUrl = `https://storage.googleapis.com/${bucket}/post/`;
    let newValue = url.split('/');
    const indexOfFirst = newValue[newValue.length - 1].indexOf('.');
    let name =
      indexOfFirst == -1
        ? newValue[newValue.length - 1] + '.jpg'
        : newValue[newValue.length - 1];
    const filename = name.replace('.', '_1000x1000.');
    const newUrl = storageUrl + filename;
    return newUrl;
  }

  /**
   * gallery
   * 갤러리에 있는 사진 한 장을 클릭할 경우 업로드
   * @param type 이미지를 넣을 firebase 폴더 이름
   */
  async getGallery(type) {
    return new Promise<any>(async (resolve) => {
      // !!!! 수정필요

      this.camera.getPicture(this.gallery).then(async (url: any) => {
        let imageurl = 'data:image/jpeg;base64,' + url;

        // this.uploadToStorage(url, type).then(async (uploaledUrl: any) => {
        resolve(imageurl);
        // });
      });
    });
  }

  uploadToStorage(url, type) {
    return new Promise<any>(async (resolve, reject) => {
      // url = 'data:image/jpeg;base64,' + url;
      const name = this.commonService.generateFilename();
      const imageName = name + '.jpg';
      this.loadingService.load();
      firebase.default
        .storage()
        .ref(`/${type}/` + imageName)
        .putString(url, 'data_url')
        .then((v) => {
          let url = `https://storage.googleapis.com/${v.metadata.bucket}/${v.metadata.fullPath}`;
          this.loadingService.hide();
          // TODO firebase extensions resizing 사용하지 않는 경우 활성화
          // if (type == 'post') {
          //   url = this.getResizeUrl(url);
          // }
          resolve(url);
        })
        .catch((error) => {
          this.loadingService.hide();
          console.error('getGallery error', error);
          reject('error');
        });
    });
  }

  permissionCheck() {
    this.alertService
      .cancelOkBtn(
        'alert confirm',
        '앱 권한 메뉴에서 허용하지 않은<br>권한을 설정하여야<br><br> 카메리 기능이(가) 이용 가능합니다.',
        '',
        '취소',
        '설정 바로가기'
      )
      .then((confirm) => {
        if (confirm) {
          // this.navController.navigateForward(['/re-confirm']);
          // 설정으로 이동
          this.openNativeSettings.open('application_details');
        }
      });
  }

  /**
   * imagePicker
   * 갤러리에 들어가서 원하는 이미지를 선택하여 업로드
   * @param type 이미지를 넣을 firebase 폴더 이름
   * @param count 최대 선택할 수 있는 이미지 개수
   */
  getImagePicker(type: string, count: number) {
    const option = {
      quality: 50,
      outputType: 1,
      disable_popover: true,
      maximumImagesCount: count,
      message: null,
    };

    return new Promise<any>((resolve, reject) => {
      let images = [];

      this.imagePicker.getPictures(option).then(
        async (results) => {
          if (results.length == 0) {
            return;
          }

          this.loadingService.load('이미지 업로드 중입니다.');
          for (var i = 0; i < results.length; i++) {
            let aftered = 'data:image/jpeg;base64,' + results[i];
            const name = this.commonService.generateFilename();
            const imageName = name + '.jpg';
            firebase.default
              .storage()
              .ref(`/${type}/` + imageName)
              .putString(aftered, 'data_url')
              .then((v) => {
                let url = `https://storage.googleapis.com/${v.metadata.bucket}/${v.metadata.fullPath}`;
                images.push(url);
              })
              .catch((error) => {
                this.loadingService.hide();
                console.log('error', error);
              });
          }
          resolve(images);
        },
        (err) => {
          console.log('getImagePicker error:', err.message, err);
          this.loadingService.hide();
        }
      );
    });
  }

  /**
   * 카메라로 촬영한 이미지의 크기를 일정 크기 이하로 리사이징 후 저장
   * @param type 이미지를 저장할 firebase 폴더 이름
   * @param maxWidth 저장할 이미지의 최대 width 지정하지 않을경우 기본값 500px
   * @param maxHeight 저장할 이미지의 최대 height 지정하지 않을경우 기본값 500px
   */
  async getResizeCamera(type, maxWidth, maxHeight) {
    return new Promise<any>((resolve) => {
      this.camera
        .getPicture(this.cameraoption)
        .then(async (url: any) => {
          this.loadingService.load();

          url = await this.resizeBase64(
            'data:image/jpeg;base64,' + url,
            maxWidth,
            maxHeight
          );
          const name = this.commonService.generateFilename() + '.jpg';
          firebase.default
            .storage()
            .ref(`/${type}/` + name)
            .putString(url, 'data_url')
            .then((v) => {
              let url = `https://storage.googleapis.com/${v.metadata.bucket}/${v.metadata.fullPath}`;
              this.loadingService.hide();
              resolve(url);
            })
            .catch((error) => {
              this.loadingService.hide();
              console.log('error', error);
            });
        })
        .catch((err) => {
          resolve(false);
        });
    });
  }

  /**
   * 갤러리에서 선택한 이미지의 크기를 일정 크기 이하로 리사이징 후 저장
   * @param type 이미지를 저장할 firebase 폴더 이름
   * @param maxWidth 저장할 이미지의 최대 width
   * @param maxHeight 저장할 이미지의 최대 height
   */
  async getResizeGallery(type, maxWidth, maxHeight) {
    return new Promise<any>((resolve) => {
      this.camera
        .getPicture(this.gallery)
        .then(async (url: any) => {
          this.loadingService.load();

          url = await this.resizeBase64(
            'data:image/jpeg;base64,' + url,
            maxWidth,
            maxHeight
          );
          const name = this.commonService.generateFilename() + '.jpg';
          firebase.default
            .storage()
            .ref(`/${type}/` + name)
            .putString(url, 'data_url')
            .then((v) => {
              let url = `https://storage.googleapis.com/${v.metadata.bucket}/${v.metadata.fullPath}`;
              this.loadingService.hide();
              resolve(url);
            })
            .catch((error) => {
              this.loadingService.hide();
              console.log('error', error);
            });
        })
        .catch((err) => {
          resolve(false);
        });
    });
  }

  /**
   * base64 url을 canvas를 이용해 resize 후 dataUrl 로 반환
   * @param base64 이미지 url
   * @param maxWidth rezise 된 이미지의 최대 width
   * @param maxHeight rezise 된 이미지의 최대 height
   */
  async resizeBase64(base64, maxWidth, maxHeight): Promise<string> {
    return new Promise((resolve) => {
      // Max size for thumbnail
      if (typeof maxWidth === 'undefined') maxWidth = 500;
      if (typeof maxHeight === 'undefined') maxHeight = 500;

      // Create and initialize two canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const canvasCopy = document.createElement('canvas');
      const copyContext = canvasCopy.getContext('2d');

      // Create original image
      let img = new Image();
      img.src = base64;
      img.onload = () => {
        console.log('img?', img.height, img.width);

        // Determine new ratio based on max size
        var ratio = 1;
        if (img.width > maxWidth) ratio = maxWidth / img.width;
        else if (img.height > maxHeight) ratio = maxHeight / img.height;

        // Draw original image in second canvas
        canvasCopy.width = img.width;
        canvasCopy.height = img.height;
        copyContext.drawImage(img, 0, 0);

        // Copy and resize second canvas to first canvas
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(
          canvasCopy,
          0,
          0,
          canvasCopy.width,
          canvasCopy.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
        resolve(canvas.toDataURL());
      };
    });
  }
}
