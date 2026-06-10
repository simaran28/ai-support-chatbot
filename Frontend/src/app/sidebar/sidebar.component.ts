// sidebar.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { DeleteChatComponent } from '../delete-chat/delete-chat.component';
import { RenameChatComponent } from '../rename-chat/rename-chat.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, DeleteChatComponent, RenameChatComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  @Output() newChat = new EventEmitter<string>();
  @Output() loadChat = new EventEmitter<string>();  // emits session_id

  documents: any[] = [];
  savedChats: any[] = [];
  uploading = false;
  uploadSuccess = '';
  uploadError = '';
  activeSessionId = '';
  activeMenuSessionId = '';

  renameModalOpen = false;
  renameModalSessionId = '';
  renameModalTitle = '';

  deleteModalOpen = false;
  deleteModalSessionId = '';
  deleteModalTitle = '';

  chatsCollapsed = false;
  docsCollapsed = true;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.loadDocuments();
    this.loadSessions();
    this.chatService.refresh$
    .subscribe(() => this.loadSessions());
  }

  loadDocuments() {
    this.chatService.getDocuments().subscribe({
      next: (res) => this.documents = res.documents,
      error: () => this.documents = []
    });
  }

  loadSessions() {
    this.chatService.getAllSessions().subscribe({
      next: (res) => this.savedChats = res.sessions,
      error: () => this.savedChats = []
    });
  }

  onNewChat() {
    this.chatService.createSession().subscribe({
      next: (res) => {
        const sessionId = res.session_id;
        this.activeSessionId = sessionId;
        this.newChat.emit(sessionId);
        this.loadSessions();  // refresh list
        this.chatService.refreshSidebar();
      },
      error: () => {
        this.activeSessionId = '';
      }
    });
  }

  onLoadChat(sessionId: string) {
    this.activeMenuSessionId = '';
    this.activeSessionId = sessionId;
    this.loadChat.emit(sessionId);
  }

  openChatActions(event: MouseEvent, sessionId: string) {
    event.stopPropagation();
    event.preventDefault();
    this.activeMenuSessionId = this.activeMenuSessionId === sessionId ? '' : sessionId;
  }

  openRenameModal(event: MouseEvent, sessionId: string, currentTitle: string) {
    event.stopPropagation();
    event.preventDefault();
    this.activeMenuSessionId = '';
    this.renameModalSessionId = sessionId;
    this.renameModalTitle = currentTitle || '';
    this.renameModalOpen = true;
  }

  closeRenameModal() {
    this.renameModalOpen = false;
    this.renameModalSessionId = '';
    this.renameModalTitle = '';
  }

  handleRenameSave(event: { sessionId: string; title: string }) {
    if (!event.title) {
      return;
    }
    this.chatService.renameChatTitle(event.sessionId, event.title).subscribe({
      next: () => {
        this.closeRenameModal();
        this.loadSessions();
        this.chatService.refreshSidebar();
      },
      error: () => {
        this.closeRenameModal();
      }
    });
  }

  openDeleteModal(event: MouseEvent, sessionId: string, title: string) {
    event.stopPropagation();
    event.preventDefault();
    this.activeMenuSessionId = '';
    this.deleteModalSessionId = sessionId;
    this.deleteModalTitle = title || 'this chat';
    this.deleteModalOpen = true;
  }

  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.deleteModalSessionId = '';
    this.deleteModalTitle = '';
  }

  confirmDeleteChat(sessionId: string) {
    this.chatService.deleteSession(sessionId).subscribe({
      next: () => {
        if (this.activeSessionId === sessionId) {
          this.activeSessionId = '';
        }
        this.closeDeleteModal();
        this.loadSessions();
        this.chatService.refreshSidebar();
      },
      error: () => {
        this.closeDeleteModal();
      }
    });
  }

  toggleChatsSection() {
    this.chatsCollapsed = !this.chatsCollapsed;
  }

  toggleDocsSection() {
    this.docsCollapsed = !this.docsCollapsed;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.uploading = true;
    this.uploadSuccess = '';
    this.uploadError = '';

    this.chatService.uploadDocument(file).subscribe({
      next: (res) => {
        this.uploading = false;
        this.uploadSuccess = `✅ ${res.filename} uploaded`;
        this.loadDocuments();
        setTimeout(() => this.uploadSuccess = '', 3000);
      },
      error: () => {
        this.uploading = false;
        this.uploadError = '❌ Upload failed. Try again.';
      }
    });
  }
}