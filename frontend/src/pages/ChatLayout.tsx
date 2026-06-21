import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import gsap from 'gsap';
import './ChatLayout.css';

export default function ChatLayout() {
  const navigate = useNavigate();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const emptyStateRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useLayoutEffect(() => {
    if (!activeSessionId && emptyStateRef.current) {
      const h2 = emptyStateRef.current.querySelector('h2');
      const p = emptyStateRef.current.querySelector('p');
      gsap.fromTo([h2, p],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out' }
      );
    }
  }, [activeSessionId]);

  return (
    <div className="chat-layout">
      <Sidebar 
        activeSessionId={activeSessionId} 
        onSelectSession={setActiveSessionId} 
      />
      <div className="chat-main">
        {activeSessionId ? (
          <ChatArea sessionId={activeSessionId} />
        ) : (
          <div className="empty-state">
            <div ref={emptyStateRef} className="empty-state-content">
              <h2>Welcome to AI Code Review</h2>
              <p>Select a chat from the sidebar or start a new one to begin.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
