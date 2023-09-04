import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RedundDetailCartPage } from './redund-detail-cart.page';

describe('RedundDetailCartPage', () => {
  let component: RedundDetailCartPage;
  let fixture: ComponentFixture<RedundDetailCartPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedundDetailCartPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RedundDetailCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
