import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WorkflowHistoryPage } from './workflow-history.page';

describe('WorkflowHistoryPage', () => {
  let component: WorkflowHistoryPage;
  let fixture: ComponentFixture<WorkflowHistoryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowHistoryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
