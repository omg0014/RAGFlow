import { useState, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { useChat } from './hooks/useChat';
import { askQuestion } from './services/api';
import './styles/design-system.css';

function App() {
  const { 
    chats, 
    currentChat, 
    currentChatId, 
    createNewChat, 
    addMessage, 
    updateLastMessage,
    deleteChat, 
    renameChat, 
    selectChat 
  } = useChat();

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const stopRef = useRef(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ragflow_theme') || 'dark');

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ragflow_theme', next);
      return next;
    });
  }, []);

  const steps = [
    "Analyzing research vector...",
    "Curating authoritative sources...",
    "Synthesizing editorial response..."
  ];

  const handleSend = async (content) => {
    let chatId = currentChatId;
    if (!chatId) {
      chatId = createNewChat();
    }

    // Add user message
    addMessage(chatId, 'user', content);
    setIsLoading(true);
    
    // Step animation logic
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      setCurrentStep(steps[stepIdx]);
      stepIdx = (stepIdx + 1) % steps.length;
    }, 1500);

    try {
      const response = await askQuestion(content);
      if (stopRef.current) return;
      
      clearInterval(stepInterval);
      setCurrentStep('');
      
      // Simulate streaming response
      const fullAnswer = response.answer;
      addMessage(chatId, 'assistant', '');
      setIsStreaming(true);
      
      let currentIdx = 0;
      const streamInterval = setInterval(() => {
        if (stopRef.current) {
          clearInterval(streamInterval);
          setIsStreaming(false);
          stopRef.current = false;
          return;
        }

        if (currentIdx <= fullAnswer.length) {
          updateLastMessage(chatId, fullAnswer.slice(0, currentIdx));
          currentIdx += Math.floor(Math.random() * 10) + 10;
        } else {
          clearInterval(streamInterval);
          updateLastMessage(chatId, fullAnswer);
          setIsStreaming(false);
        }
      }, 15);
    } catch (error) {
      clearInterval(stepInterval);
      setCurrentStep('');
      setIsStreaming(false);
      addMessage(chatId, 'assistant', `Error: ${error.message || 'Failed to get a response.'}`);
    } finally {
      setIsLoading(false);
      stopRef.current = false;
    }
  };

  const handleStop = () => {
    stopRef.current = true;
    setIsStreaming(false);
    setIsLoading(false);
  };

  return (
    <div className="layout-container" data-theme={theme}>
      <Sidebar 
        chats={chats} 
        currentChatId={currentChatId}
        onSelectChat={selectChat}
        onCreateChat={createNewChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="main-content">
        <ChatWindow 
          messages={currentChat?.messages || []} 
          isLoading={isLoading}
          isStreaming={isStreaming}
          currentStep={currentStep}
        />
        <ChatInput 
          onSend={handleSend} 
          onStop={handleStop}
          isLoading={isLoading} 
          isStreaming={isStreaming}
        />
      </main>
    </div>
  );
}

export default App;
