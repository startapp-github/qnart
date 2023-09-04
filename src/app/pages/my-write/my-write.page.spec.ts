import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyWritePage } from './my-write.page';

describe('MyWritePage', () => {
  let component: MyWritePage;
  let fixture: ComponentFixture<MyWritePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyWritePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyWritePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
