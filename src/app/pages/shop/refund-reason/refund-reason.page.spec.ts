import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RefundReasonPage } from './refund-reason.page';

describe('RefundReasonPage', () => {
  let component: RefundReasonPage;
  let fixture: ComponentFixture<RefundReasonPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundReasonPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RefundReasonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
