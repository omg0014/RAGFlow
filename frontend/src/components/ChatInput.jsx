import { Send, Square } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/chat-input.css';

export const ChatInput = ({ onSend, onStop, isLoading, isStreaming }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="chat-input-container">
      <div className="prompt-templates">
        <button onClick={() => setInput('Summarize this text: ')}>Summarize text</button>
        <button onClick={() => setInput('Explain this code: ')}>Explain code</button>
        <button onClick={() => setInput('Generate ideas for: ')}>Generate ideas</button>
      </div>
      <form className="chat-input-wrapper" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          rows="1"
          placeholder="Send a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        {(isLoading || isStreaming) ? (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button" 
            className="stop-btn" 
            onClick={onStop}
          >
            <Square size={16} fill="white" />
          </motion.button>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="submit" 
            className="send-btn" 
            disabled={!input.trim()}
          >
            <Send size={18} />
          </motion.button>
        )}
      </form>
      <p className="input-footer">
        Research Assistant can make mistakes. Verify important information.
      </p>
    </div>
  );
};
