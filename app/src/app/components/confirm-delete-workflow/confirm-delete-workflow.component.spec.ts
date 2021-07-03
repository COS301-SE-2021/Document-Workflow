import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConfirmDeleteWorkflowComponent } from './confirm-delete-workflow.component';

describe('ConfirmDeleteWorkflowComponent', () => {
  let component: ConfirmDeleteWorkflowComponent;
  let fixture: ComponentFixture<ConfirmDeleteWorkflowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmDeleteWorkflowComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
