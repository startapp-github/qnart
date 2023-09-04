import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CommonQuestionPage } from './common-question.page';

describe('CommonQuestionPage', () => {
  let component: CommonQuestionPage;
  let fixture: ComponentFixture<CommonQuestionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonQuestionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CommonQuestionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
