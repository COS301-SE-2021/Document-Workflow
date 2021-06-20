import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';


import { AddSignatureComponent } from './add-signature.component';

describe('AddSignatureComponent', () => {
  let component: AddSignatureComponent;
  let fixture: ComponentFixture<AddSignatureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSignatureComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ToDO: Add More Unit Testing

  it('should return false if no signature is drawn', () => {
    component.isCanvasBlank();
    expect(component.isCanvasBlank()).toBeFalse();
  });
});
