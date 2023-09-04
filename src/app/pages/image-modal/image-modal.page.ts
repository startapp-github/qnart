/** @format */

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.page.html',
  styleUrls: ['./image-modal.page.scss'],
})
export class ImageModalPage implements OnInit, AfterViewInit {
  @ViewChild('slides') slides: IonSlides;

  slideOpts = {
    speed: 400,
    zoom: true,
    spaceBetween: 0,
    slidesPerView: 1,
    initialSlide: 0,
    loop: false,
  };
  images: string[];
  index: number;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.slides.update();
    this.slideOpts.initialSlide = this.index;
  }

  modalDone() {
    this.modalCtrl.dismiss();
  }
}
