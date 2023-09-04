import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrderCancelPage } from './order-cancel.page';

describe('OrderCancelPage', () => {
  let component: OrderCancelPage;
  let fixture: ComponentFixture<OrderCancelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderCancelPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderCancelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
