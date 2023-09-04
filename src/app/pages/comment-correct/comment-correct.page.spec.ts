import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CommentCorrectPage } from './comment-correct.page';

describe('CommentCorrectPage', () => {
  let component: CommentCorrectPage;
  let fixture: ComponentFixture<CommentCorrectPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentCorrectPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentCorrectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
