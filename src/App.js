
// import React, { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';

// // Connect to the Gateway (Port 8080)
// const socket = io('http://localhost:8080', {
//   transports: ['websocket']
// });

// function App() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const scrollRef = useRef();

//   useEffect(() => {
//     socket.on('receive_message', (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     return () => socket.off('receive_message');
//   }, []);

//   // Auto-scroll logic
//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (input.trim()) {
//       socket.emit('send_message', { text: input });
//       setInput('');
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.chatBox}>
//         {messages.map((msg, i) => (
//           <div key={i} style={styles.message}>
//             <strong style={{ color: '#007bff' }}>{msg.sender}: </strong>
//             <span>{msg.text}</span>
//             <small style={styles.time}>{msg.time}</small>
//           </div>
//         ))}
//         <div ref={scrollRef} />
//       </div>

//       <form onSubmit={sendMessage} style={styles.form}>
//         <input
//           style={styles.input}
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type a message..."
//         />
//         <button type="submit" style={styles.button}>Send</button>
//       </form>
//     </div>
//   );
// }

// const styles = {
//   container: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f2f5', padding: '20px' },
//   chatBox: { flex: 1, overflowY: 'auto', background: '#fff', borderRadius: '8px', padding: '15px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
//   message: { marginBottom: '10px', padding: '8px', borderBottom: '1px solid #eee' },
//   time: { display: 'block', fontSize: '10px', color: '#999' },
//   form: { display: 'flex', gap: '10px' },
//   input: { flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
//   button: { padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
// };

// export default App;


import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:8080', { transports: ['websocket'] });

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