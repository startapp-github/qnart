import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  public loading;
  public isLoading = false;
  constructor(public loader: LoadingController) {}

  async load(message?) {
    if (!this.isLoading) {
      this.isLoading = true;

      this.loading = await this.loader.create({
        duration: 20000,
        translucent: true,
        cssClass: 'custom-class custom-loading',
        backdropDismiss: false,
        message,
      });

      await this.loading.present();
      this.loading.onDidDismiss().then(() => {
        this.loading = null;
        this.isLoading = false;
      });
    }
  }

  hide() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  async lognLoad(message?) {
    this.loading = await this.loader.create({
      translucent: true,
      // cssClass: '',
      backdropDismiss: false,
      message,
    });
    await this.loading.present();
  }
}
