import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useChat = () => {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('ragflow_chats');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentChatId, setCurrentChatId] = useState(() => {
    const saved = localStorage.getItem('ragflow_current_chat_id');
    return saved || null;
  });

  useEffect(() => {
    localStorage.setItem('ragflow_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('ragflow_current_chat_id', currentChatId);
    } else {
      localStorage.removeItem('ragflow_current_chat_id');
    }
  }, [currentChatId]);

  const currentChat = chats.find(chat => chat.id === currentChatId) || null;

  const createNewChat = useCallback(() => {
    const newChat = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  }, []);

  const addMessage = useCallback((chatId, role, content) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const newMessages = [...chat.messages, { role, content, timestamp: new Date().toISOString() }];
        
        // Auto-generate title from first user message if it's currently 'New Chat'
        let newTitle = chat.title;
        if (chat.title === 'New Chat' && role === 'user') {
          newTitle = content.slice(0, 30) + (content.length > 30 ? '...' : '');
        }
        
        return { ...chat, messages: newMessages, title: newTitle };
      }
      return chat;
    }));
  }, []);

  const deleteChat = useCallback((chatId) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  }, [currentChatId]);

  const renameChat = useCallback((chatId, newTitle) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  }, []);

  const updateLastMessage = useCallback((chatId, content) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId && chat.messages.length > 0) {
        const newMessages = [...chat.messages];
        newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], content };
        return { ...chat, messages: newMessages };
      }
      return chat;
    }));
  }, []);

  const selectChat = useCallback((chatId) => {
    setCurrentChatId(chatId);
  }, []);

  return {
    chats,
    currentChat,
    currentChatId,
    createNewChat,
    addMessage,
    updateLastMessage,
    deleteChat,
    renameChat,
    selectChat
  };
};
