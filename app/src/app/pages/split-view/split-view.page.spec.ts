import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SplitViewPage } from './split-view.page';

describe('SplitViewPage', () => {
  let component: SplitViewPage;
  let fixture: ComponentFixture<SplitViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SplitViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
