import type { RootState } from '../store';

export const selectChatState = (state: RootState) => state.chat;

export const selectChatThreads = (state: RootState) =>
  state.chat.chatOrder.map(id => state.chat.chats[id]).filter(Boolean);

export const selectChatById = (state: RootState, chatId: string) =>
  state.chat.chats[chatId];

export const selectMessagesByChatId = (state: RootState, chatId: string) => {
  const chat = state.chat.chats[chatId];
  if (!chat) return [];
  return chat.messageIds.map(id => state.chat.messages[id]).filter(Boolean);
};

export const selectLastMessageByChatId = (state: RootState, chatId: string) => {
  const chat = state.chat.chats[chatId];
  if (!chat) return undefined;
  const lastId = chat.messageIds[chat.messageIds.length - 1];
  return lastId ? state.chat.messages[lastId] : undefined;
};

