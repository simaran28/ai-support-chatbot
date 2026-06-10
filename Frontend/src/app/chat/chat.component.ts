import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { Message } from '../models/message';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  messages: Message[] = [];
  userInput = '';
  sessionId = '';
  userName = 'User';
  isLoading = false;
  messageCount = 0;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.startNewChat();
    this.chatService.refreshSidebar();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {}
  }

  // ── Called from sidebar New Chat button ──
  startNewChat(sessionId?: string) {
    this.sessionId = sessionId || uuidv4();
    this.messageCount = 0;
    this.userInput = '';
    this.messages = [{
      role: 'assistant',
      content: 'Hello! I am your AI support assistant. Upload a document and ask me anything about it!',
      timestamp: new Date()
    }];
  }

  // ── Called from sidebar saved chat click ──
  loadExistingChat(sessionId: string) {
    this.sessionId = sessionId;
    this.messages = [];
    this.isLoading = true;

    this.chatService.getHistory(sessionId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.messageCount = res.history.length;

        if (res.history.length === 0) {
          this.messages = [{
            role: 'assistant',
            content: 'No messages found in this session.',
            timestamp: new Date()
          }];
          return;
        }

        // Convert history to messages
        this.messages = res.history.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date()
        }));
      },
      error: () => {
        this.isLoading = false;
        this.messages = [{
          role: 'assistant',
          content: 'Could not load chat history.',
          timestamp: new Date()
        }];
      }
    });
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const question = this.userInput.trim();
    this.userInput = '';

    this.messages.push({
      role: 'user',
      content: question,
      timestamp: new Date()
    });

    this.isLoading = true;
    this.messageCount++;

    this.chatService.sendMessage(this.sessionId, question, this.userName).subscribe({
      next: (res) => {
        this.messages.push({
          role: 'assistant',
          content: res.answer,
          timestamp: new Date(),
          sources: res.sources
        });
        this.isLoading = false;
        this.messageCount++;
        this.chatService.refreshSidebar();
      },
      error: () => {
        this.messages.push({
          role: 'assistant',
          content: 'Sorry, something went wrong. Please check if the backend is running.',
          timestamp: new Date()
        });
        this.isLoading = false;
      }
    });
  }

  clearChat() {
    this.chatService.clearSession(this.sessionId).subscribe();
    this.sessionId = uuidv4();
    this.messageCount = 0;
    this.messages = [{
      role: 'assistant',
      content: 'Chat cleared! Start a new conversation.',
      timestamp: new Date()
    }];
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}