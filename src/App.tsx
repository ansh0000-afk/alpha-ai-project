import React, { useState, useEffect, useRef } from 'react';

// Aapki Gemini API Key (Pehle se added hai)
const API_KEY = "AQ.Ab8RN6KpW_UWOTzS9SLuI6pnymSC2grsLcLaH1-D331MpBrvlA";

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('alpha_ai_chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'model', text: 'Hello! Main Alpha AI hoon. Voice, Image, Search, aur PDF Chat sab ready hai. Main aapki kya help kar sakta hoon?' }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('alpha_ai_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Voice Input (Speech to Text)
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Aapke browser me voice recognition support nahi hai.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Hindi & English support
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  // Text to Speech (Voice Response)
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Image & File Handle
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPdfText(event.target?.result as string);
        alert('File content attach ho gaya hai!');
      };
      reader.readAsText(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !imageFile && !pdfText) || loading) return;

    let userPrompt = input;
    if (pdfText) {
      userPrompt += `\n\n[Attached File Content]:\n${pdfText}`;
    }

    const userMsg = { role: 'user', text: input || 'Attached File/Image', image: imageFile };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    
    // Reset inputs
    setInput('');
    setImageFile(null);
    setPdfText(null);
    setLoading(true);

    try {
      const contents = updatedMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
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
        throw new Error(data.error.message || "API Error");
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
    setMessages([{ role: 'model', text: 'Chat clear ho gayi hai. Boliye kya help chahiye?' }]);
    localStorage.removeItem('alpha_ai_chat_history');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Alpha AI</h1>
        <button onClick={clearChat} style={styles.clearBtn}>Clear Chat</button>
      </header>

      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
            {msg.image && <img src={msg.image} alt="Upload" style={styles.previewImage} />}
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            {msg.role === 'model' && (
              <button onClick={() => speakText(msg.text)} style={styles.speakBtn}>🔊 Listen</button>
            )}
          </div>
        ))}
        {loading && (
          <div style={styles.aiBubble}>
            <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.8 }}>Alpha AI is thinking...</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {imageFile && (
        <div style={styles.fileBar}>
          <span>📷 Image Attached</span>
          <button onClick={() => setImageFile(null)} style={styles.removeBtn}>✕</button>
        </div>
      )}

      {pdfText && (
        <div style={styles.fileBar}>
          <span>📄 File Attached</span>
          <button onClick={() => setPdfText(null)} style={styles.removeBtn}>✕</button>
        </div>
      )}

      <div style={styles.inputContainer}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*,.pdf,.txt" 
          onChange={handleFileUpload} 
        />
        <button onClick={() => fileInputRef.current?.click()} style={styles.iconBtn}>📎</button>
        <button onClick={startVoiceInput} style={isRecording ? styles.recordingBtn : styles.iconBtn}>
          {isRecording ? '🎙️...' : '🎤'}
        </button>
        <input
          type="text"
          placeholder="Type or speak a message..."
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
  container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#1e293b', borderBottom: '1px solid #334155' },
  title: { fontSize: '20px', margin: 0, color: '#38bdf8', fontWeight: 'bold' },
  clearBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' },
  chatBox: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2563eb', color: '#fff', padding: '10px 14px', borderRadius: '15px 15px 2px 15px', maxWidth: '80%', wordBreak: 'break-word' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#334155', color: '#f8fafc', padding: '10px 14px', borderRadius: '15px 15px 15px 2px', maxWidth: '80%', wordBreak: 'break-word' },
  speakBtn: { marginTop: '5px', backgroundColor: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '12px', padding: 0 },
  fileBar: { display: 'flex', justifyContent: 'space-between', padding: '8px 15px', backgroundColor: '#334155', fontSize: '14px' },
  removeBtn: { backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' },
  previewImage: { maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', marginBottom: '8px' },
  inputContainer: { display: 'flex', padding: '10px', backgroundColor: '#1e293b', gap: '8px', alignItems: 'center' },
  iconBtn: { backgroundColor: '#334155', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '8px', fontSize: '18px', cursor: 'pointer' },
  recordingBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '8px', fontSize: '18px', cursor: 'pointer' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '15px' },
  sendBtn: { backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', border: 'none', padding: '0 16px', height: '40px', borderRadius: '8px', cursor: 'pointer' }
};
    
