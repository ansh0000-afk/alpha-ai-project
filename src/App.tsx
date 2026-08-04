import React, { useState, useEffect, useRef } from 'react';

// Integrated Gemini API Key
const API_KEY = "AQ.Ab8RN6KpW_UWOTzS9SLuI6pnymSC2grsLcLaH1-D331MpBrvlA";

export default function App() {
  const [activeTab, setActiveTab] = useState('all-rounder');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('alpha_ai_chat_history');
    return saved ? JSON.parse(saved) : [
      {
        role: 'model',
        text: `Namaste! Main Alpha AI hoon 🙏\nAapka intelligent, fast, friendly, aur creative personal AI assistant.\n\n✨ "Think Smart. Build Smart. Achieve More." — Powered by Alpha AI\n\n🚀 Main in sabhi domains me aapki step-by-step help kar sakta hoon:\n\n📚 Study & Exam Assistant (Special HSC Class 12 Focus):\nAccounts (BK) & Maths: Step-by-step numerical solving, Partnership Final Accounts, Journal Entries, Integration, Matrices, LPP.\nEconomics, OCM, SP & English: 8-mark/4-mark structured answers, distinction tables, key concepts & paper presentation tips.\n\n💻 Coding, Website & Mobile App Builder:\nWeb & Mobile (HTML, CSS, JS, React, Node.js, Python, Flutter, C++, Java, Git).\nWebsite design, Android/iOS app guide, bug fixing, aur clean code explanation.\n\n📹 YouTube, Content Writing & Social Media:\nViral titles, video script hooks, full Hinglish scripts, SEO descriptions, hashtags, thumbnail ideas & social strategy.\n\n📝 Resumes, Documents & Writing:\nProfessional emails, cover letters, resume building, interview coaching, essay writing, aur document/PDF summaries.\n\n🖼️ Multimodal Photo & Notes Analyzer:\nAttach photos of study notes, textbook problems, handwritten questions, or code screenshots for instant step-by-step solutions.\n\n📅 Productivity, Daily Planning & Career Advice:\nDaily timetables, study schedules, career guidance, interview prep, travel planning, aur business advice.\n\n💡 Standard Response Format:\nShort answer ➔ Detailed explanation ➔ Step-by-step solution ➔ Examples ➔ Pro tips ➔ Summary\n\nNiche mode select karein ya direct koi bhi question pucho dost! Main Alpha AI ready hoon.`
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('alpha_ai_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    let contextPrefix = "";
    if (activeTab === 'hsc-commerce') {
      contextPrefix = "[Focus Mode: HSC Class 12 Commerce - BK, Accounts, Economics, OCM, SP, Maths] ";
    }

    const userMsg = { role: 'user', text: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const contents = updatedMessages.map((msg, idx) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: (idx === updatedMessages.length - 1 && msg.role === 'user') ? contextPrefix + msg.text : msg.text }]
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "API Configuration Error");
      }

      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        { role: 'model', text: `Error: ${error.message || 'Connection fail ho gaya.'}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'model',
      text: 'Chat clear ho gayi hai. Boliye kya help chahiye?'
    }]);
    localStorage.removeItem('alpha_ai_chat_history');
  };

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <div style={styles.logoBadge}>🤖</div>
          <h1 style={styles.title}>Alpha AI</h1>
        </div>
        <div style={styles.headerIcons}>
          <button onClick={clearChat} style={styles.clearBtn}>Clear Chat</button>
        </div>
      </header>

      {/* Mode Pills Selector */}
      <div style={styles.modeBar}>
        <button 
          onClick={() => setActiveTab('all-rounder')} 
          style={activeTab === 'all-rounder' ? styles.activeTab : styles.tab}
        >
          ✨ Alpha AI All-Rounder <span style={styles.subTag}>Hinglish AI</span>
        </button>
        <button 
          onClick={() => setActiveTab('hsc-commerce')} 
          style={activeTab === 'hsc-commerce' ? styles.activeTab : styles.tab}
        >
          🎓 HSC 12th Commerce <span style={styles.subTag}>BK & Acc, Eco, OCM, SP</span>
        </button>
      </div>

      {/* Chat Messages Container */}
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={msg.role === 'user' ? styles.userRow : styles.aiRow}>
            {msg.role === 'model' && <div style={styles.aiAvatar}>🤖</div>}
            <div style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
              <div style={styles.senderTitle}>{msg.role === 'user' ? 'Aap' : 'Alpha AI'}</div>
              <p style={styles.messageContent}>{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div style={styles.aiRow}>
            <div style={styles.aiAvatar}>🤖</div>
            <div style={styles.aiBubble}>
              <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.8, color: '#94a3b8' }}>
                Alpha AI is thinking...
              </p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field Bar */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Niche mode select karein ya direct koi bhi question pucho dost! Main Alpha AI ready hoon."
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

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#090d16', color: '#e2e8f0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoBadge: { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  title: { fontSize: '18px', margin: 0, color: '#f8fafc', fontWeight: '700' },
  clearBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  modeBar: { display: 'flex', gap: '10px', padding: '10px 20px', backgroundColor: '#0b1120', borderBottom: '1px solid #1e293b', overflowX: 'auto' },
  tab: { backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', whitespace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' },
  activeTab: { backgroundColor: '#4f46e5', color: '#ffffff', border: '1px solid #6366f1', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', whitespace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' },
  subTag: { fontSize: '11px', opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '10px' },
  chatBox: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' },
  userRow: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  aiRow: { display: 'flex', justifyContent: 'flex-start', gap: '10px' },
  aiAvatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
  userBubble: { backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 16px', borderRadius: '16px 16px 2px 16px', maxWidth: '82%', wordBreak: 'break-word' },
  aiBubble: { backgroundColor: '#1e293b', color: '#f1f5f9', padding: '14px 18px', borderRadius: '16px 16px 16px 2px', maxWidth: '85%', wordBreak: 'break-word', border: '1px solid #334155' },
  senderTitle: { fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', opacity: 0.7 },
  messageContent: { margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '14px' },
  inputContainer: { display: 'flex', padding: '14px 20px', backgroundColor: '#0f172a', gap: '12px', borderTop: '1px solid #1e293b' },
  input: { flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#090d16', color: '#f8fafc', fontSize: '14px', outline: 'none' },
  sendBtn: { backgroundColor: '#38bdf8', color: '#090d16', fontWeight: 'bold', border: 'none', padding: '0 22px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }
};
