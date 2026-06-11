// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {

  private api = 'https://ai-support-chatbot-backend-w2m6.onrender.com';
  private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();


  constructor(private http: HttpClient) {}

  refreshSidebar() {
    this.refreshSubject.next();
  }

  sendMessage(sessionId: string, question: string, userName: string): Observable<any> {
    return this.http.post(`${this.api}/chat`, {
      session_id: sessionId,
      question,
      user_name: userName
    });
  }

  uploadDocument(file: File): Observable<any> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.api}/upload`, form);
  }

  getDocuments(): Observable<any> {
    return this.http.get(`${this.api}/documents`);
  }

  getHistory(sessionId: string): Observable<any> {
    return this.http.get(`${this.api}/history/${sessionId}`);
  }

  clearSession(sessionId: string): Observable<any> {
    return this.http.delete(`${this.api}/clear/${sessionId}`);
  }

  getAllSessions(): Observable<any> {
    return this.http.get(`${this.api}/sessions`);
  }

  createSession(userName: string = 'Guest'): Observable<any> {
    return this.http.post(`${this.api}/sessions`, {
      user_name: userName
    });
  }

  renameChatTitle(sessionId: string, title: string): Observable<any> {
    return this.http.patch(`${this.api}/sessions/${sessionId}`, { title });
  }

  deleteSession(sessionId: string): Observable<any> {
    return this.http.delete(`${this.api}/sessions/${sessionId}`);
  }
}