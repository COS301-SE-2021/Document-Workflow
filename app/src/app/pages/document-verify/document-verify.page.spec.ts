import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DocumentVerifyPage } from './document-verify.page';

describe('DocumentVerifyPage', () => {
  let component: DocumentVerifyPage;
  let fixture: ComponentFixture<DocumentVerifyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentVerifyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentVerifyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
