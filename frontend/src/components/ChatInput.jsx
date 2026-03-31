import { Send, Paperclip, Square } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/chat-input.css';

export const ChatInput = ({ onSend, onStop, isLoading, isStreaming }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setInput(prev => `${prev}\n\n[File Content: ${file.name}]\n${text}\n[End of File Content]\n`);
      };
      reader.readAsText(file);
    } else {
      alert('Currently only .txt files are supported for frontend-only extraction.');
    }
    // Reset file input
    e.target.value = '';
  };

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
        <button 
          type="button" 
          className="attach-btn" 
          title="Attach file"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={20} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          accept=".txt"
        />
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
