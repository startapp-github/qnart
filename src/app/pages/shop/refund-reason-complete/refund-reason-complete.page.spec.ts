import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RefundReasonCompletePage } from './refund-reason-complete.page';

describe('RefundReasonCompletePage', () => {
  let component: RefundReasonCompletePage;
  let fixture: ComponentFixture<RefundReasonCompletePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundReasonCompletePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RefundReasonCompletePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
