import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddWorkflowPage } from './add-workflow.page';

describe('AddWorkflowPage', () => {
  let component: AddWorkflowPage;
  let fixture: ComponentFixture<AddWorkflowPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddWorkflowPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddWorkflowPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
