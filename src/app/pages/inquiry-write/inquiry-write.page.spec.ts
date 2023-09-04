import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InquiryWritePage } from './inquiry-write.page';

describe('InquiryWritePage', () => {
  let component: InquiryWritePage;
  let fixture: ComponentFixture<InquiryWritePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InquiryWritePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InquiryWritePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
