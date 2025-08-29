import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ChatScreen from '@/components/matching/ChatScreen';

export default function ChatRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  if (!id) {
    return null;
  }

  return <ChatScreen chatId={id} />;
}
