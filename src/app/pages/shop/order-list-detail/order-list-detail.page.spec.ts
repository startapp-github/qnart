import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrderListDetailPage } from './order-list-detail.page';

describe('OrderListDetailPage', () => {
  let component: OrderListDetailPage;
  let fixture: ComponentFixture<OrderListDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderListDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
