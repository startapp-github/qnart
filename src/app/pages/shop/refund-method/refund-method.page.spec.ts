import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RefundMethodPage } from './refund-method.page';

describe('RefundMethodPage', () => {
  let component: RefundMethodPage;
  let fixture: ComponentFixture<RefundMethodPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundMethodPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RefundMethodPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
