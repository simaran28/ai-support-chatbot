import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameChatComponent } from './rename-chat.component';

describe('RenameChatComponent', () => {
  let component: RenameChatComponent;
  let fixture: ComponentFixture<RenameChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenameChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenameChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
