import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InquiryDetailPage } from './inquiry-detail.page';

describe('InquiryDetailPage', () => {
  let component: InquiryDetailPage;
  let fixture: ComponentFixture<InquiryDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InquiryDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InquiryDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
