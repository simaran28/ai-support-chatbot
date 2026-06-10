import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-chat',
  standalone: true,
  imports: [],
  templateUrl: './delete-chat.component.html',
  styleUrl: './delete-chat.component.css'
})
export class DeleteChatComponent {
  @Input() sessionId = '';
  @Input() title = '';
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
}
