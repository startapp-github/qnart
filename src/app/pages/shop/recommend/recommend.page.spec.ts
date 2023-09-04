import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RecommendPage } from './recommend.page';

describe('RecommendPage', () => {
  let component: RecommendPage;
  let fixture: ComponentFixture<RecommendPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecommendPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecommendPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
