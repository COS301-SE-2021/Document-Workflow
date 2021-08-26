import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WorkflowTemplatePage } from './workflow-template.page';

describe('WorkflowTemplatePage', () => {
  let component: WorkflowTemplatePage;
  let fixture: ComponentFixture<WorkflowTemplatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowTemplatePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowTemplatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
