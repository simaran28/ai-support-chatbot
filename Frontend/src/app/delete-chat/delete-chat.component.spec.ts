import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteChatComponent } from './delete-chat.component';

describe('DeleteChatComponent', () => {
  let component: DeleteChatComponent;
  let fixture: ComponentFixture<DeleteChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
