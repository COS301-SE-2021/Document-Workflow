import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DocumentEditPage } from './document-edit.page';

describe('DocumentEditPage', () => {
  let component: DocumentEditPage;
  let fixture: ComponentFixture<DocumentEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentEditPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
