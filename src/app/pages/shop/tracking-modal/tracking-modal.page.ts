import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpService } from 'src/app/services/http.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-tracking-modal',
  templateUrl: './tracking-modal.page.html',
  styleUrls: ['./tracking-modal.page.scss'],
})
export class TrackingModalPage implements OnInit {
  @Input() order;
  compay: string = '';
  trackingInfo: any;
  constructor(
    private modalController: ModalController,
    private httpService: HttpService,
    public loadingService: LoadingService
  ) {}

  async ngOnInit() {
    await this.loadingService.load();
    const companyList = await this.httpService.companyApi().catch((err) => {
      console.log({ err });
    });

    if (this.order.companyCode) {
      this.compay = companyList?.Company?.filter(
        (data) => data.Code == this.order.companyCode
      )[0].Name;

      this.trackingInfo = await this.httpService
        .trackingInfo(this.order.companyCode, this.order.invoiceNum)
        .catch((err) => {
          console.log({ err });
        });
    }
    this.loadingService.hide();
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
