export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export interface Document {
  id: number;
  filename: string;
  chunks: number;
}