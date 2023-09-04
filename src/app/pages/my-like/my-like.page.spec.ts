import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyLikePage } from './my-like.page';

describe('MyLikePage', () => {
  let component: MyLikePage;
  let fixture: ComponentFixture<MyLikePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyLikePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyLikePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
