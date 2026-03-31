import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import '../styles/chat-window.css';

export const ChatWindow = ({ messages, isLoading, currentStep, isStreaming }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isStreaming]);

  if (!messages || messages.length === 0) {
    return (
      <div className="empty-state">
        <h1 className="welcome-title">Research Assistant</h1>
        <p className="welcome-subtitle">Ask me anything...</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="messages-list">
        {messages.map((msg, index) => (
          <MessageBubble 
            key={index} 
            role={msg.role} 
            content={msg.content} 
            isStreaming={isStreaming && index === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}
        {isLoading && !isStreaming && (
          <div className="typing-indicator">
            <div className="ai-avatar">AI</div>
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
            {currentStep && <span className="step-text">{currentStep}</span>}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
