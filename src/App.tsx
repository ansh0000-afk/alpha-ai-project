import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key initialization
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('alpha_ai_chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'model', text: 'Hello! Main Alpha AI hoon. Main aapki kya help kar sakta hoon?' }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('alpha_ai_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (!API_KEY) {
        throw new Error("Gemini API Key missing! Check .env file.");
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convert chat format for Gemini API
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(input);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev, 
        { role: 'model', text: `Error: ${error.message || 'Connection check karein.'}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'model', text: 'Chat clear ho gayi hai. Main Alpha AI hoon, boliye kya help chahiye?' }]);
    localStorage.removeItem('alpha_ai_chat_history');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Alpha AI</h1>
        <button onClick={clearChat} style={styles.clearBtn}>Clear Chat</button>
      </header>

      {/* Messages Box */}
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
            <p style={{ margin: 0 }}>{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div style={styles.aiBubble}>
            <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.8 }}>Alpha AI is thinking...</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.sendBtn} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

// Styling Object
const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#1e293b', borderBottom: '1px solid #334155' },
  title: { fontSize: '20px', margin: 0, color: '#38bdf8' },
  clearBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' },
  chatBox: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2563eb', color: '#fff', padding: '10px 14px', borderRadius: '15px 15px 2px 15px', maxWidth: '80%', wordBreak: 'break-word' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#334155', color: '#f8fafc', padding: '10px 14px', borderRadius: '15px 15px 15px 2px', maxWidth: '80%', wordBreak: 'break-word' },
  inputContainer: { display: 'flex', padding: '10px', backgroundColor: '#1e293b', gap: '10px' },
  input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '16px' },
  sendBtn: { backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', border: 'none', padding: '0 20px', borderRadius: '8px', cursor: 'pointer' }
};
        
