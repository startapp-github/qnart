import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PopularPage } from './popular.page';

describe('PopularPage', () => {
  let component: PopularPage;
  let fixture: ComponentFixture<PopularPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopularPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PopularPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
