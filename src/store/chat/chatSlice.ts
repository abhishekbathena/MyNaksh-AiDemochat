import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { INITIAL_CHAT_LIST } from '../../data/initialChatList';
import type { ChatMessage } from '../../types/chat';

export interface ChatThread {
  id: string;
  title: string;
  subscriber?: string;
  subtitlePrefix?: 'Customer' | 'Agent' | 'System';
  messageIds: string[];
  unreadCount?: number;
  isOnline?: boolean;
}

export interface NormalizedChatState {
  chats: Record<string, ChatThread>;
  chatOrder: string[];
  messages: Record<string, ChatMessage>;
}

function normalizeInitialState(): NormalizedChatState {
  const messages: Record<string, ChatMessage> = {};
  for (const m of INITIAL_CHAT_LIST.messages) messages[m.id] = m;

  const chats: Record<string, ChatThread> = {};
  const chatOrder: string[] = [];
  for (const c of INITIAL_CHAT_LIST.chats) {
    chats[c.id] = {
      id: c.id,
      title: c.title,
      subscriber: c.subscriber,
      subtitlePrefix: c.subtitlePrefix,
      messageIds: c.messageIds,
      unreadCount: c.unreadCount,
      isOnline: c.isOnline,
    };
    chatOrder.push(c.id);
  }

  return {
    chats,
    chatOrder,
    messages,
  };
}

const initialState: NormalizedChatState = normalizeInitialState();

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    upsertManyMessages(
      state,
      action: PayloadAction<{ chatId: string; messages: ChatMessage[] }>,
    ) {
      const { chatId, messages } = action.payload;
      const chat = state.chats[chatId];
      if (!chat) return;

      for (const m of messages) {
        state.messages[m.id] = m;
        if (!chat.messageIds.includes(m.id)) {
          chat.messageIds.push(m.id);
        }
      }
    },
    addMessage(
      state,
      action: PayloadAction<{ chatId: string; message: ChatMessage }>,
    ) {
      const { chatId, message } = action.payload;
      const chat = state.chats[chatId];
      if (!chat) return;

      state.messages[message.id] = message;
      chat.messageIds.push(message.id);
    },
    setMessageReaction(
      state,
      action: PayloadAction<{ messageId: string; emoji: string | null }>,
    ) {
      const { messageId, emoji } = action.payload;
      const msg = state.messages[messageId];
      if (!msg) return;
      if (!emoji) {
        delete msg.reactions;
        return;
      }
      const existing = msg.reactions ?? [];
      const idx = existing.indexOf(emoji);
      if (idx >= 0) {
        const next = existing.slice();
        next.splice(idx, 1);
        if (next.length === 0) delete msg.reactions;
        else msg.reactions = next;
        return;
      }
      msg.reactions = [...existing, emoji];
    },
    setAIFeedback(
      state,
      action: PayloadAction<{
        messageId: string;
        feedbackType: 'liked' | 'disliked' | null;
      }>,
    ) {
      const { messageId, feedbackType } = action.payload;
      const msg = state.messages[messageId];
      if (!msg) return;
      if (msg.sender !== 'ai_astrologer') return;

      if (!feedbackType) {
        delete msg.feedbackType;
        delete msg.feedbackChips;
        msg.hasFeedback = false;
        return;
      }

      msg.hasFeedback = true;
      msg.feedbackType = feedbackType;
      if (feedbackType === 'liked') {
        delete msg.feedbackChips;
      }
    },
    toggleAIDislikeChip(
      state,
      action: PayloadAction<{
        messageId: string;
        chip: 'Inaccurate' | 'Too Vague' | 'Too Long';
      }>,
    ) {
      const { messageId, chip } = action.payload;
      const msg = state.messages[messageId];
      if (!msg) return;
      if (msg.sender !== 'ai_astrologer') return;
      if (msg.feedbackType !== 'disliked') return;

      const existing = msg.feedbackChips ?? [];
      const idx = existing.indexOf(chip);
      if (idx >= 0) {
        const next = existing.slice();
        next.splice(idx, 1);
        if (next.length === 0) delete msg.feedbackChips;
        else msg.feedbackChips = next;
        return;
      }
      msg.feedbackChips = [...existing, chip];
    },
  },
});

export const {
  addMessage,
  upsertManyMessages,
  setMessageReaction,
  setAIFeedback,
  toggleAIDislikeChip,
} = chatSlice.actions;
export const chatReducer = chatSlice.reducer;

