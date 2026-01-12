


import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL, { transports: ['websocket'] });

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.landingContainer}>
      <h1 style={styles.glitchTitle}>ANNONY WORLD</h1>
      <button style={styles.enterButton} onClick={() => navigate('/chat')}>
        Enter in Anony World
      </button>
    </div>
  );
};

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    socket.on('load_history', (history) => setMessages(history));
    socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
    return () => {
      socket.off('load_history');
      socket.off('receive_message');
    };
  }, []);

  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const send = (e) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit('send_message', { text: input });
      setInput('');
    }
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.chatHeader}>
        <span style={{color: '#00fff9'}}>● Live Lobby</span>
        <small style={{color: '#666'}}>Encrypted & Anonymous</small>
      </div>
      <div style={styles.messageArea}>
        {messages.map((m, i) => (
          <div key={i} style={styles.messageBubble}>
            <b style={styles.senderName}>{m.sender}</b>
            <p style={styles.messageText}>{m.text}</p>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={send} style={styles.inputArea}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          style={styles.inputField} 
          placeholder="Type your message..."
        />
        <button style={styles.sendButton}>SEND</button>
      </form>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

const styles = {
  landingContainer: { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505', color: '#ffffff' },
  glitchTitle: { fontSize: '3.5rem', letterSpacing: '8px', marginBottom: '30px', fontFamily: 'monospace', textAlign: 'center' },
  enterButton: { padding: '15px 40px', fontSize: '1rem', backgroundColor: 'transparent', color: '#00fff9', border: '1px solid #00fff9', cursor: 'pointer', borderRadius: '2px', fontWeight: 'bold' },
  chatContainer: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0a', color: '#e0e0e0' },
  chatHeader: { padding: '15px 25px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between' },
  messageArea: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  messageBubble: { backgroundColor: '#111', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #00fff9', maxWidth: '80%' },
  senderName: { fontSize: '0.75rem', color: '#00fff9', marginBottom: '4px', display: 'block' },
  messageText: { margin: 0, fontSize: '0.95rem' },
  inputArea: { padding: '20px', display: 'flex', gap: '10px', backgroundColor: '#050505' },
  inputField: { flex: 1, padding: '12px', backgroundColor: '#111', border: '1px solid #222', color: 'white', borderRadius: '4px', outline: 'none' },
  sendButton: { padding: '0 30px', backgroundColor: '#00fff9', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }
};