export type MessageSender =
  | 'system'
  | 'user'
  | 'ai_astrologer'
  | 'human_astrologer';

export type MessageType = 'event' | 'text' | 'ai' | 'human';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  type: MessageType;
  hasFeedback?: boolean;
  feedbackType?: 'liked' | 'disliked';
  feedbackChips?: ('Inaccurate' | 'Too Vague' | 'Too Long')[];
  replyTo?: string;
  /** Emoji reactions keyed by message id — extended in UI state */
  reactions?: string[];
}
