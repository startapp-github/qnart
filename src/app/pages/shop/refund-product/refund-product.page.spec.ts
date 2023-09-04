import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RefundProductPage } from './refund-product.page';

describe('RefundProductPage', () => {
  let component: RefundProductPage;
  let fixture: ComponentFixture<RefundProductPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundProductPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RefundProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
