import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyinfoAddressPage } from './myinfo-address.page';

describe('MyinfoAddressPage', () => {
  let component: MyinfoAddressPage;
  let fixture: ComponentFixture<MyinfoAddressPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyinfoAddressPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyinfoAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
