import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rename-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rename-chat.component.html',
  styleUrl: './rename-chat.component.css'
})
export class RenameChatComponent implements OnChanges {
  @Input() sessionId = '';
  @Input() title = '';
  @Output() save = new EventEmitter<{ sessionId: string; title: string }>();
  @Output() cancel = new EventEmitter<void>();

  newTitle = '';

  ngOnChanges(changes: SimpleChanges) {
    const titleChange = changes['title'];
    if (titleChange && titleChange.currentValue !== undefined) {
      this.newTitle = titleChange.currentValue || '';
    }
  }
}
