import type { ChatMessage } from '../types/chat';

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'system',
    text: 'Your session with Astrologer Vikram has started.',
    timestamp: 1734681480000,
    type: 'event',
  },
  {
    id: '2',
    sender: 'user',
    text: 'Namaste. I am feeling very anxious about my current job. Can you look at my chart?',
    timestamp: 1734681600000,
    type: 'text',
  },
  {
    id: '3',
    sender: 'ai_astrologer',
    text: 'Namaste! I am analyzing your birth details. Currently, you are running through Shani Mahadasha. This often brings pressure but builds resilience.',
    timestamp: 1734681660000,
    type: 'ai',
    hasFeedback: true,
    feedbackType: 'liked',
  },
  {
    id: '4',
    sender: 'human_astrologer',
    text: 'I see the same. Look at your 6th house; Saturn is transiting there. This is why you feel the workload is heavy.',
    timestamp: 1734681720000,
    type: 'human',
  },
  {
    id: '5',
    sender: 'user',
    text: 'Is there any remedy for this? I find it hard to focus.',
    timestamp: 1734681780000,
    type: 'text',
    replyTo: '4',
  },
  {
    id: '6',
    sender: 'ai_astrologer',
    text: 'I suggest chanting the Shani Mantra 108 times on Saturdays. Would you like the specific mantra text?',
    timestamp: 1734681840000,
    type: 'ai',
    hasFeedback: false,
  },
];
