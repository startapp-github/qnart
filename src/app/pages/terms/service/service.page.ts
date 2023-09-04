/** @format */

import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-service',
  templateUrl: './service.page.html',
  styleUrls: ['./service.page.scss'],
})
export class ServicePage implements OnInit {
  constructor(public dataService: DataService) {}

  ngOnInit() {
    this.dataService.inIt();
  }
}
