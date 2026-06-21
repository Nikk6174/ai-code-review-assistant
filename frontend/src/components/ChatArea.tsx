import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MESSAGES_QUERY, SAVE_MESSAGE_MUTATION } from '../graphql/operations';
import { Send, Loader2, User, Cpu } from 'lucide-react';
import gsap from 'gsap';
import './ChatArea.css';

interface Message {
  messageId: string;
  role: 'USER' | 'AI';
  message: string;
  timestamp: string;
}

interface ChatAreaProps {
  sessionId: string;
}

export default function ChatArea({ sessionId }: ChatAreaProps) {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<'GROK' | 'OLLAMA'>('GROK');
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data, loading, refetch } = useQuery(GET_MESSAGES_QUERY, {
    variables: { sessionId },
    skip: !sessionId,
  });

  const [saveMessage, { loading: saving }] = useMutation(SAVE_MESSAGE_MUTATION, {
    onCompleted: () => {
      setPendingUserMessage(null);
      refetch();
    },
    onError: () => {
      setPendingUserMessage(null);
    }
  });

  useLayoutEffect(() => {
    if (inputWrapperRef.current) {
      gsap.fromTo(inputWrapperRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 }
      );
    }
  }, [sessionId]);

  useLayoutEffect(() => {
    if (data?.getMessages && listRef.current) {
      const msgs = listRef.current.querySelectorAll('.message-bubble');
      gsap.fromTo(msgs,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [data?.getMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data?.getMessages, pendingUserMessage]);

  const handleSend = () => {
    if (!input.trim() || !sessionId) return;
    
    const userMessage = input;
    setInput('');
    setPendingUserMessage(userMessage);

    saveMessage({
      variables: {
        sessionId,
        role: 'USER',
        message: userMessage,
        model: model
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-area">
      <div className="messages-container">
        {loading ? (
          <div className="loading-container">
            <Loader2 className="spinner" size={24} />
          </div>
        ) : (
          <div ref={listRef} className="messages-list">
            {data?.getMessages?.map((msg: Message) => (
              <div 
                key={msg.messageId} 
                className={`message-wrapper ${msg.role === 'USER' ? 'user' : 'ai'}`}
              >
                <div className={`message-bubble`}>
                  <div className="message-avatar">
                    {msg.role === 'USER' ? <User size={16} /> : <Cpu size={16} />}
                  </div>
                  <div className="message-content">
                    {/* Basic pre for code, can be upgraded to markdown renderer later */}
                    <pre>{msg.message}</pre>
                  </div>
                </div>
              </div>
            ))}
            
            {pendingUserMessage && (
              <>
                <div className="message-wrapper user">
                  <div className="message-bubble animate-slide-up">
                    <div className="message-avatar">
                      <User size={16} />
                    </div>
                    <div className="message-content">
                      <pre>{pendingUserMessage}</pre>
                    </div>
                  </div>
                </div>
                
                <div className="message-wrapper ai">
                  <div className="message-bubble animate-slide-up thinking-bubble">
                    <div className="message-avatar">
                      <Cpu size={16} />
                    </div>
                    <div className="message-content">
                      <div className="thinking-indicator">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div ref={inputWrapperRef} className="chat-input-wrapper">
        <div className="model-selector">
          <button 
            className={`model-btn ${model === 'GROK' ? 'active' : ''}`}
            onClick={() => setModel('GROK')}
          >
            Cloud (Grok)
          </button>
          <button 
            className={`model-btn ${model === 'OLLAMA' ? 'active' : ''}`}
            onClick={() => setModel('OLLAMA')}
          >
            Local (Ollama)
          </button>
        </div>
        <div className="chat-input-container glass-panel">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your code or type a message..."
            disabled={saving}
          />
          <button 
            className="send-button" 
            onClick={handleSend}
            disabled={!input.trim() || saving}
          >
            {saving ? <Loader2 className="spinner" size={18} /> : <Send size={18} />}
          </button>
        </div>
        <div className="input-footer">
          <p>AI Code Review Assistant - Start by pasting code snippet</p>
        </div>
      </div>
    </div>
  );
}
