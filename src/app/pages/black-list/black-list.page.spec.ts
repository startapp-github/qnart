import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BlackListPage } from './black-list.page';

describe('BlackListPage', () => {
  let component: BlackListPage;
  let fixture: ComponentFixture<BlackListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlackListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BlackListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
