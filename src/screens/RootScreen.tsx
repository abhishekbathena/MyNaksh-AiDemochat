import React, { useState } from 'react';

import { ChatListScreen } from './ChatListScreen';
import { ChatThreadScreen } from './ChatThreadScreen';

export function RootScreen() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  if (activeChatId) {
    return (
      <ChatThreadScreen
        chatId={activeChatId}
        onBack={() => setActiveChatId(null)}
      />
    );
  }

  return <ChatListScreen onOpenChat={setActiveChatId} />;
}

