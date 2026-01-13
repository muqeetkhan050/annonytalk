import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  transports: ["websocket"],
});

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  // 🆕 FETCH MESSAGE HISTORY ON MOUNT
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

  // SOCKET LISTENERS
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

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    socket.emit("send_message", { text: input });
    setInput("");
  };

  if (loading) {
    return (
      <div style={{ ...styles.chatContainer, justifyContent: "center", alignItems: "center" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={styles.chatContainer}>
      <div style={styles.chatHeader}>
        <span style={{ color: "#00fff9" }}>● Live Lobby ({messages.length} messages)</span>
        <small style={{ color: "#666" }}>Encrypted & Anonymous</small>
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

      <form onSubmit={sendMessage} style={styles.inputArea}>
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
}

// 🔥 ADD THIS STYLES OBJECT
const styles = {
  chatContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#0a0a0a",
    color: "#e0e0e0"
  },
  chatHeader: {
    padding: "15px 25px",
    borderBottom: "1px solid #1a1a1a",
    display: "flex",
    justifyContent: "space-between"
  },
  messageArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  messageBubble: {
    backgroundColor: "#111",
    padding: "12px 16px",
    borderRadius: "8px",
    borderLeft: "3px solid #00fff9",
    maxWidth: "80%"
  },
  senderName: {
    fontSize: "0.75rem",
    color: "#00fff9",
    marginBottom: "4px",
    display: "block"
  },
  messageText: {
    margin: 0,
    fontSize: "0.95rem"
  },
  inputArea: {
    padding: "20px",
    display: "flex",
    gap: "10px",
    backgroundColor: "#050505"
  },
  inputField: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#111",
    border: "1px solid #222",
    color: "white",
    borderRadius: "4px",
    outline: "none"
  },
  sendButton: {
    padding: "0 30px",
    backgroundColor: "#00fff9",
    color: "#000",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer"
  }
};