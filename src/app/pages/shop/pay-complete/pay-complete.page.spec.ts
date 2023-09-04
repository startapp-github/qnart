import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PayCompletePage } from './pay-complete.page';

describe('PayCompletePage', () => {
  let component: PayCompletePage;
  let fixture: ComponentFixture<PayCompletePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayCompletePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PayCompletePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
