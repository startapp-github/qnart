import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProductInquiryPage } from './product-inquiry.page';

describe('ProductInquiryPage', () => {
  let component: ProductInquiryPage;
  let fixture: ComponentFixture<ProductInquiryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductInquiryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductInquiryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
