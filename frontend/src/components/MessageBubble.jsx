import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/message-bubble.css';

export const MessageBubble = ({ role, content, isStreaming }) => {
  const isAI = role === 'assistant' || role === 'ai';
  const [copied, setCopied] = useState(false);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    // Debounce highlighting during streaming for better performance
    const timer = setTimeout(() => {
      Prism.highlightAll();
    }, 150);
    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    if (isAI && content) {
      // Basic URL detection
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = content.match(urlRegex);
      if (matches) {
        // Deduplicate and filter
        setSources([...new Set(matches)]);
      }
    }
  }, [isAI, content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`message-row ${isAI ? 'ai' : 'user'}`}
    >
      <div className="message-container">
        <div className="avatar">
          {isAI ? 'AI' : 'U'}
        </div>
        <div className="message-content">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <pre className={className}>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && <span className="typing-cursor">|</span>}
          
          {sources.length > 0 && (
            <div className="sources-container">
              <div className="sources-label">Sources</div>
              <div className="sources-list">
                {sources.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="source-tag">
                    {new URL(url).hostname.replace('www.', '')}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        {isAI && content && (
          <button className="copy-btn" onClick={handleCopy} title="Copy response">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}
      </div>
    </motion.div>
  );
};
