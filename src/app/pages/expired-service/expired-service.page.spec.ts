import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExpiredServicePage } from './expired-service.page';

describe('ExpiredServicePage', () => {
  let component: ExpiredServicePage;
  let fixture: ComponentFixture<ExpiredServicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpiredServicePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpiredServicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
