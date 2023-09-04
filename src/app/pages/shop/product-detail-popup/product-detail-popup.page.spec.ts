import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProductDetailPopupPage } from './product-detail-popup.page';

describe('ProductDetailPopupPage', () => {
  let component: ProductDetailPopupPage;
  let fixture: ComponentFixture<ProductDetailPopupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductDetailPopupPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailPopupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
