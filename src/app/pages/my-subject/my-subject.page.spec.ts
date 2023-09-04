import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MySubjectPage } from './my-subject.page';

describe('MySubjectPage', () => {
  let component: MySubjectPage;
  let fixture: ComponentFixture<MySubjectPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MySubjectPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MySubjectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
