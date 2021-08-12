import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DocumentAddPage } from './document-add.page';

describe('DocumentAddPage', () => {
  let component: DocumentAddPage;
  let fixture: ComponentFixture<DocumentAddPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentAddPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
