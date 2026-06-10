// app.ts
import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChatComponent } from './chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    ChatComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  @ViewChild('chatComponent') chatComponent!: ChatComponent;

  onNewChat(sessionId: string) {
    this.chatComponent.startNewChat(sessionId);
  }

  onLoadChat(sessionId: string) {
    this.chatComponent.loadExistingChat(sessionId);
  }
}