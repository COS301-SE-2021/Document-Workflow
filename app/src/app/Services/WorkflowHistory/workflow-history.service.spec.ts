import { TestBed } from '@angular/core/testing';

import { WorkflowHistoryService } from './workflow-history.service';

describe('WorkflowHistoryService', () => {
  let service: WorkflowHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkflowHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
