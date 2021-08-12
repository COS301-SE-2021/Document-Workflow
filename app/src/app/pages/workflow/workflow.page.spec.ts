import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WorkflowPage } from './workflow.page';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';

describe('WorkflowPage', () => {
  let component: WorkflowPage;
  let fixture: ComponentFixture<WorkflowPage>;
  let dEL: DebugElement;
  let hEL: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowPage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    component = null;
    dEL = null;
    hEL = null;
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('initialises with a title of Home Page', () => {
    expect(component.title).toEqual('Home Page');
  });

  it('setting the title to a supplied value', () => {
    dEL = fixture.debugElement.query(By.css('ion-title'));
    hEL = dEL.nativeElement;

    component.changeTitle('EPI-USE Document Workflow');
    fixture.detectChanges();
    expect(component.title).toEqual('Home Page');
    expect(hEL.textContent).toContain('Home Page');
  });
});
