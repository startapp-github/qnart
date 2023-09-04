import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RefundListPage } from './refund-list.page';

describe('RefundListPage', () => {
  let component: RefundListPage;
  let fixture: ComponentFixture<RefundListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RefundListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
