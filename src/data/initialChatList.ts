import type { ChatMessage } from '../types/chat';

export interface InitialChatListThread {
  id: string;
  title: string;
  subscriber?: string;
  subtitlePrefix?: 'Customer' | 'Agent' | 'System';
  messageIds: string[];
  unreadCount?: number;
  isOnline?: boolean;
}

export interface InitialChatListPayload {
  chats: InitialChatListThread[];
  messages: ChatMessage[];
}

const base = new Date(2026, 3, 6, 9, 0, 0, 0).getTime();
const ts = (i: number) => base + i * 60_000;

function buildChat(
  chatId: string,
  title: string,
  subscriber: string,
  messages: ChatMessage[],
) {
  return {
    chat: {
      id: chatId,
      title,
      subscriber,
      subtitlePrefix: 'Customer' as const,
      messageIds: messages.map(m => m.id),
      isOnline: true,
    },
    messages,
  };
}

const c1 = buildChat('chat-1', 'Low Power • Saturn', '919901425378', [
  {
    id: 'c1-1',
    sender: 'system',
    text: 'Your session has started.',
    timestamp: ts(1),
    type: 'event',
  },
  {
    id: 'c1-2',
    sender: 'user',
    text: 'Namaste. I am feeling very anxious about my job.',
    timestamp: ts(2),
    type: 'text',
  },
  {
    id: 'c1-3',
    sender: 'ai_astrologer',
    text: 'Namaste! I am analyzing your chart. Shani periods can feel heavy but build resilience.',
    timestamp: ts(3),
    type: 'ai',
    hasFeedback: true,
    feedbackType: 'liked',
  },
  {
    id: 'c1-4',
    sender: 'user',
    text: 'Is this a good time to switch jobs?',
    timestamp: ts(4),
    type: 'text',
  },
  {
    id: 'c1-5',
    sender: 'ai_astrologer',
    text: 'Wait 6–8 weeks; focus on interviews quietly. The transit supports preparation more than sudden change.',
    timestamp: ts(5),
    type: 'ai',
    hasFeedback: true,
    feedbackType: 'disliked',
  },
  {
    id: 'c1-6',
    sender: 'user',
    text: 'Any remedy for focus?',
    timestamp: ts(6),
    type: 'text',
    replyTo: 'c1-5',
  },
  {
    id: 'c1-7',
    sender: 'ai_astrologer',
    text: 'Try Shani mantra 108 times on Saturdays. Also keep a simple routine for sleep.',
    timestamp: ts(7),
    type: 'ai',
    hasFeedback: false,
  },
  {
    id: 'c1-8',
    sender: 'human_astrologer',
    text: 'Also consider lighting a sesame oil diya on Saturdays.',
    timestamp: ts(8),
    type: 'human',
  },
  {
    id: 'c1-9',
    sender: 'user',
    text: 'Thank you. I will try.',
    timestamp: ts(9),
    type: 'text',
  },
  {
    id: 'c1-10',
    sender: 'system',
    text: 'Tip: long-press a message to react.',
    timestamp: ts(10),
    type: 'event',
  },
]);

const c2 = buildChat('chat-2', 'Mid Power • Moon', '919901425378', [
  { id: 'c2-1', sender: 'system', text: 'Your session has started.', timestamp: ts(11), type: 'event' },
  { id: 'c2-2', sender: 'user', text: 'I feel emotionally low these days.', timestamp: ts(12), type: 'text' },
  {
    id: 'c2-3',
    sender: 'ai_astrologer',
    text: 'Your Moon needs grounding. Water + sleep cycles are key right now.',
    timestamp: ts(13),
    type: 'ai',
    hasFeedback: true,
    feedbackType: 'liked',
  },
  { id: 'c2-4', sender: 'user', text: 'Any simple practice?', timestamp: ts(14), type: 'text' },
  {
    id: 'c2-5',
    sender: 'ai_astrologer',
    text: 'Chant “Om Som Somaya Namah” 108 times on Mondays.',
    timestamp: ts(15),
    type: 'ai',
    hasFeedback: true,
    feedbackType: 'disliked',
  },
  { id: 'c2-6', sender: 'user', text: 'Ok.', timestamp: ts(16), type: 'text' },
  { id: 'c2-7', sender: 'human_astrologer', text: 'Add a 10-minute walk after sunset.', timestamp: ts(17), type: 'human' },
  { id: 'c2-8', sender: 'user', text: 'Noted.', timestamp: ts(18), type: 'text' },
  { id: 'c2-9', sender: 'ai_astrologer', text: 'You’ll feel improvement within 2 weeks.', timestamp: ts(19), type: 'ai', hasFeedback: false },
  { id: 'c2-10', sender: 'system', text: 'Reminder: Your data stays on-device for this demo.', timestamp: ts(20), type: 'event' },
]);

const c3 = buildChat('chat-3', 'High Power • Jupiter', '919901425378', [
  { id: 'c3-1', sender: 'system', text: 'Your session has started.', timestamp: ts(21), type: 'event' },
  { id: 'c3-2', sender: 'user', text: 'Will my finances improve this year?', timestamp: ts(22), type: 'text' },
  { id: 'c3-3', sender: 'ai_astrologer', text: 'Yes, Jupiter support brings steady gains through learning and mentors.', timestamp: ts(23), type: 'ai', hasFeedback: true, feedbackType: 'liked' },
  { id: 'c3-4', sender: 'user', text: 'Should I invest now?', timestamp: ts(24), type: 'text' },
  { id: 'c3-5', sender: 'ai_astrologer', text: 'Start small, diversify, and avoid impulsive moves in the next 30 days.', timestamp: ts(25), type: 'ai', hasFeedback: false },
  { id: 'c3-6', sender: 'human_astrologer', text: 'Focus on skill-building; income follows capability.', timestamp: ts(26), type: 'human' },
  { id: 'c3-7', sender: 'user', text: 'Makes sense.', timestamp: ts(27), type: 'text' },
  { id: 'c3-8', sender: 'ai_astrologer', text: 'A Thursday routine (yellow offerings) can strengthen Guru energy.', timestamp: ts(28), type: 'ai', hasFeedback: true, feedbackType: 'disliked' },
  { id: 'c3-9', sender: 'user', text: 'Ok thanks.', timestamp: ts(29), type: 'text', replyTo: 'c3-8' },
  { id: 'c3-10', sender: 'system', text: 'You can rate the session when you end chat.', timestamp: ts(30), type: 'event' },
]);

const c4 = buildChat('chat-4', 'Powerful • Mars', '919901425378', [
  { id: 'c4-1', sender: 'system', text: 'Your session has started.', timestamp: ts(31), type: 'event' },
  { id: 'c4-2', sender: 'user', text: 'I get angry quickly. Why?', timestamp: ts(32), type: 'text' },
  { id: 'c4-3', sender: 'ai_astrologer', text: 'Strong Mars can do that. Channel it into disciplined action.', timestamp: ts(33), type: 'ai', hasFeedback: true, feedbackType: 'liked' },
  { id: 'c4-4', sender: 'user', text: 'What should I do daily?', timestamp: ts(34), type: 'text' },
  { id: 'c4-5', sender: 'human_astrologer', text: 'Breathwork + strength training 3x a week helps.', timestamp: ts(35), type: 'human' },
  { id: 'c4-6', sender: 'ai_astrologer', text: 'Avoid spicy foods on Tuesdays; it helps balance heat.', timestamp: ts(36), type: 'ai', hasFeedback: false },
  { id: 'c4-7', sender: 'user', text: 'Ok.', timestamp: ts(37), type: 'text' },
  { id: 'c4-8', sender: 'ai_astrologer', text: 'Also wear red only when needed—too much can amplify intensity.', timestamp: ts(38), type: 'ai', hasFeedback: true, feedbackType: 'disliked' },
  { id: 'c4-9', sender: 'user', text: 'Interesting.', timestamp: ts(39), type: 'text' },
  { id: 'c4-10', sender: 'system', text: 'Session ongoing…', timestamp: ts(40), type: 'event' },
]);

export const INITIAL_CHAT_LIST: InitialChatListPayload = {
  chats: [
    { ...c1.chat, unreadCount: 1 },
    { ...c2.chat, unreadCount: 0 },
    { ...c3.chat, unreadCount: 2 },
    { ...c4.chat, unreadCount: 0 },
  ],
  messages: [...c1.messages, ...c2.messages, ...c3.messages, ...c4.messages],
};

