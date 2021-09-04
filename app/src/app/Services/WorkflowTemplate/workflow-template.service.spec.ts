import { TestBed } from '@angular/core/testing';

import { WorkflowTemplateService } from './workflow-template.service';

describe('WorkflowTemplateService', () => {
  let service: WorkflowTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkflowTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
