import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { Menu } from 'lucide-react';
import gsap from 'gsap';
import './ChatLayout.css';

export default function ChatLayout() {
  const navigate = useNavigate();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      <button
        className={`mobile-sidebar-backdrop ${isSidebarOpen ? 'visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-label="Close sidebar"
        type="button"
      />
      <Sidebar 
        activeSessionId={activeSessionId} 
        onSelectSession={setActiveSessionId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="chat-main">
        <header className="mobile-chat-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
            type="button"
          >
            <Menu size={20} />
          </button>
          <div>
            <span className="mobile-header-kicker">AI Code Review</span>
            <h1>Review Assistant</h1>
          </div>
        </header>
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
