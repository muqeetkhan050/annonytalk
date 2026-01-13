

import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0) translateX(0);
      opacity: 0.3;
    }
    25% {
      transform: translateY(-30px) translateX(15px);
      opacity: 0.6;
    }
    50% {
      transform: translateY(-60px) translateX(-15px);
      opacity: 0.3;
    }
    75% {
      transform: translateY(-30px) translateX(10px);
      opacity: 0.5;
    }
  }
  
  @keyframes glow {
    from {
      text-shadow: 0 0 20px rgba(0, 255, 249, 0.5);
    }
    to {
      text-shadow: 0 0 40px rgba(0, 255, 249, 0.8), 0 0 60px rgba(0, 255, 249, 0.6);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  transports: ["websocket"],
});

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const scrollRef = useRef();

  // FETCH MESSAGE HISTORY ON MOUNT
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_SOCKET_URL}/messages`);
        const data = await response.json();
        setMessages(data);
        console.log("📚 Loaded", data.length, "messages");
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("receive_message", (msg) => {
      console.log("📨", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("send_message", { text: input });
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.chatContainer, justifyContent: "center", alignItems: "center" }}>
        <div style={styles.loader}></div>
      </div>
    );
  }

  // WELCOME SCREEN
  if (showWelcome) {
    return (
      <div style={styles.welcomeContainer}>
        <div style={styles.welcomeContent}>
          <h1 style={styles.welcomeTitle}>
            Enter the Annony Room
          </h1>
          <p style={styles.welcomeSubtitle}>
            to chat with people around the world
          </p>
          <button 
            style={styles.enterButton}
            onClick={() => setShowWelcome(false)}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05) translateY(-2px)";
              e.target.style.boxShadow = "0 10px 40px rgba(0, 255, 249, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1) translateY(0)";
              e.target.style.boxShadow = "0 5px 25px rgba(0, 255, 249, 0.3)";
            }}
          >
            ENTER ROOM
          </button>
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🔒</span>
              <span>Encrypted</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>👤</span>
              <span>Anonymous</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🌍</span>
              <span>Global</span>
            </div>
          </div>
        </div>
        
        {/* Animated particles */}
        <div style={styles.particles}>
          {[...Array(60)].map((_, i) => (
            <div 
              key={i} 
              style={{
                ...styles.particle,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 3}s`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`
              }}
            />
          ))}
        </div>

        {/* Gradient overlays */}
        <div style={styles.gradientTop}></div>
        <div style={styles.gradientBottom}></div>
      </div>
    );
  }

  // CHAT ROOM
  return (
    <div style={styles.chatContainer}>
      <div style={styles.chatHeader}>
        <div>
          <span style={{ color: "#00fff9", fontSize: "1.2rem", fontWeight: "bold" }}>● Annony Room</span>
          <small style={{ color: "#666", marginLeft: "15px" }}>{messages.length} messages</small>
        </div>
        <small style={{ color: "#666" }}>🔒 Encrypted & Anonymous</small>
      </div>

      <div style={styles.messageArea}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={styles.messageBubble}>
              <b style={styles.senderName}>{m.sender}</b>
              <p style={styles.messageText}>{m.text}</p>
              <span style={styles.messageTime}>{m.time}</span>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={styles.inputField}
          placeholder="Type your message..."
        />
        <button style={styles.sendButton} onClick={sendMessage}>
          SEND →
        </button>
      </div>
    </div>
  );
}

const styles = {
  // WELCOME SCREEN STYLES
  welcomeContainer: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  welcomeContent: {
    textAlign: "center",
    zIndex: 10,
    padding: "40px",
    maxWidth: "900px",
    animation: "fadeIn 1s ease-out"
  },
  welcomeTitle: {
    fontSize: "5rem",
    fontWeight: "900",
    marginBottom: "30px",
    letterSpacing: "3px",
    lineHeight: "1.2",
    background: "linear-gradient(135deg, #ffffff 0%, #00fff9 50%, #00d4ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: "glow 3s ease-in-out infinite alternate",
    textTransform: "uppercase"
  },
  welcomeSubtitle: {
    fontSize: "1.5rem",
    color: "#888",
    marginBottom: "60px",
    fontWeight: "300",
    letterSpacing: "1px"
  },
  enterButton: {
    padding: "22px 70px",
    fontSize: "1.4rem",
    fontWeight: "700",
    backgroundColor: "#00fff9",
    color: "#000",
    border: "none",
    borderRadius: "60px",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "3px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 5px 25px rgba(0, 255, 249, 0.3)",
    position: "relative",
    overflow: "hidden"
  },
  features: {
    display: "flex",
    justifyContent: "center",
    gap: "50px",
    marginTop: "80px",
    flexWrap: "wrap"
  },
  feature: {
    fontSize: "1.1rem",
    color: "#555",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.3s ease"
  },
  featureIcon: {
    fontSize: "1.5rem"
  },
  particles: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 1,
    pointerEvents: "none"
  },
  particle: {
    position: "absolute",
    backgroundColor: "#00fff9",
    borderRadius: "50%",
    animation: "float 7s infinite ease-in-out",
    boxShadow: "0 0 10px rgba(0, 255, 249, 0.5)"
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "200px",
    background: "radial-gradient(ellipse at top, rgba(0, 255, 249, 0.1) 0%, transparent 70%)",
    zIndex: 2,
    pointerEvents: "none"
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "200px",
    background: "radial-gradient(ellipse at bottom, rgba(0, 255, 249, 0.08) 0%, transparent 70%)",
    zIndex: 2,
    pointerEvents: "none"
  },

  // CHAT ROOM STYLES
  chatContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#0a0a0a",
    color: "#e0e0e0",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  chatHeader: {
    padding: "20px 30px",
    borderBottom: "2px solid #1a1a1a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#050505"
  },
  messageArea: {
    flex: 1,
    overflowY: "auto",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    backgroundColor: "#0a0a0a"
  },
  emptyState: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  emptyText: {
    color: "#444",
    fontSize: "1.1rem"
  },
  messageBubble: {
    backgroundColor: "#111",
    padding: "14px 18px",
    borderRadius: "12px",
    borderLeft: "4px solid #00fff9",
    maxWidth: "75%",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    transition: "all 0.2s ease"
  },
  senderName: {
    fontSize: "0.8rem",
    color: "#00fff9",
    marginBottom: "6px",
    display: "block",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  messageText: {
    margin: 0,
    fontSize: "1rem",
    lineHeight: "1.5",
    color: "#e0e0e0"
  },
  messageTime: {
    fontSize: "0.7rem",
    color: "#555",
    marginTop: "6px",
    display: "block"
  },
  inputArea: {
    padding: "25px 30px",
    display: "flex",
    gap: "15px",
    backgroundColor: "#050505",
    borderTop: "2px solid #1a1a1a"
  },
  inputField: {
    flex: 1,
    padding: "15px 20px",
    backgroundColor: "#111",
    border: "2px solid #1a1a1a",
    color: "white",
    borderRadius: "8px",
    outline: "none",
    fontSize: "1rem",
    transition: "all 0.2s ease"
  },
  sendButton: {
    padding: "0 40px",
    backgroundColor: "#00fff9",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "1rem",
    letterSpacing: "1px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 10px rgba(0, 255, 249, 0.3)"
  },
  loader: {
    width: "50px",
    height: "50px",
    border: "4px solid #1a1a1a",
    borderTop: "4px solid #00fff9",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  }
};