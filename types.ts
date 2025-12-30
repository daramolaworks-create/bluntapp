export interface BluntMessage {
  id: string;
  content: string;
  isAnonymous: boolean;
  allowReply: boolean;
  createdAt: number;
  acknowledged: boolean;
  replies: BluntReply[];
  // New fields
  recipientName: string;
  recipientNumber: string;
  deliveryMode: 'SMS' | 'WHATSAPP' | 'EMAIL';
  scheduledFor: number; // Timestamp
  attachment?: string; // Base64 data URL
  attachmentType?: 'image' | 'file';
  attachmentName?: string;
  postToFeed?: boolean;
  denied?: boolean;
}

export interface BluntReply {
  id: string;
  content: string;
  createdAt: number;
}

export enum BluntErrorType {
  VIOLATION = 'VIOLATION',
  GENERIC = 'GENERIC',
}

export interface ModerationResult {
  safe: boolean;
  reason?: string;
}
