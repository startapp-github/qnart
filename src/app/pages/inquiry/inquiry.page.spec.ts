import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InquiryPage } from './inquiry.page';

describe('InquiryPage', () => {
  let component: InquiryPage;
  let fixture: ComponentFixture<InquiryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InquiryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InquiryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
