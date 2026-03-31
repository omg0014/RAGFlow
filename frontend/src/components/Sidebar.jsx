import { Plus, MessageSquare, Trash2, Edit2, Check, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/sidebar.css';

export const Sidebar = ({ chats, currentChatId, onSelectChat, onCreateChat, onDeleteChat, onRenameChat, theme, onToggleTheme }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditValue(chat.title);
  };

  const handleConfirmRename = (e, chatId) => {
    e.stopPropagation();
    onRenameChat(chatId, editValue);
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <aside className="sidebar">
      <button className="new-chat-btn" onClick={onCreateChat}>
        <Plus size={16} />
        <span>New Chat</span>
      </button>

      <div className="chat-history">
        {chats.map(chat => (
          <motion.div 
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={chat.id} 
            className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <MessageSquare size={16} className="chat-icon" />
            
            {editingId === chat.id ? (
              <div className="edit-container" onClick={e => e.stopPropagation()}>
                <input 
                  autoFocus
                  type="text" 
                  value={editValue} 
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirmRename(e, chat.id)}
                />
                <button onClick={e => handleConfirmRename(e, chat.id)}><Check size={12} /></button>
                <button onClick={handleCancelRename}><X size={12} /></button>
              </div>
            ) : (
              <span className="chat-title">{chat.title}</span>
            )}

            {!editingId && (
              <div className="chat-actions">
                <button onClick={(e) => handleStartRename(e, chat)}><Edit2 size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}><Trash2 size={14} /></button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
};
