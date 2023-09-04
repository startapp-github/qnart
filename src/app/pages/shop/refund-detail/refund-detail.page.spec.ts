import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RefundDetailPage } from './refund-detail.page';

describe('RefundDetailPage', () => {
  let component: RefundDetailPage;
  let fixture: ComponentFixture<RefundDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RefundDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
