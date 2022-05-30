export type uuid = string;

export enum EventType {
  QUICK_REPLY = 'quick_reply',
}

export interface Message {
  id: uuid;
  conversationId: uuid;
  authorId: uuid | undefined;
  sentOn: Date;
  payload: any;
}

export interface Content {
  type: string;
}

export interface QuickReplyContent extends Content {
  type: EventType.QUICK_REPLY;
  text?: string;
  payload?: any;
}

export type MessageContent = QuickReplyContent;
