import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, ChevronLeft, Bot } from "lucide-react";

const BOT_RESPONSES = [
  "I can help you book an appointment! Navigate to 'Book Visit' from the home page to get started.",
  "Your health records are securely stored. Go to 'Health Records' in the navigation bar to view or upload.",
  "Need a lab test? Head to the 'Lab Tests' section to browse packages and book a slot.",
  "For any medication queries, please consult your doctor. I can help you book a visit!",
  "Your wallet balance and reward points can be found under the 'Wallet' section.",
  "I'm a demo assistant. In the full version, I'll be able to look up your records, results, and appointments in real-time!"
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! 👋 I'm your personal health assistant. Ask me anything about your health records, lab results, medications, or appointments.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bodyRef = useRef(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Mock bot response with typing delay
    setTimeout(() => {
      setIsTyping(false);
      const randomResponse = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: randomResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  if (!isOpen) {
    return (
      <button className="chatbot-fab" onClick={() => setIsOpen(true)}>
        <MessageSquare size={22} />
        Chat
      </button>
    );
  }

  return (
    <div className="chatbot-window">
      {/* Header */}
      <div className="chatbot-header">
        <button 
          onClick={() => setIsOpen(false)} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
        >
          <ChevronLeft size={22} color="var(--blue)" />
        </button>
        <div className="chatbot-header-avatar">
          <Bot size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h3>Arvaya CareBot</h3>
          <div className="chatbot-header-status">● Online</div>
        </div>
        <button 
          onClick={() => setIsOpen(false)} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
        >
          <X size={20} color="var(--muted)" />
        </button>
      </div>

      {/* Body / Messages */}
      <div className="chatbot-body" ref={bodyRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`chat-bubble ${msg.sender === "user" ? "user" : ""}`}>
            {msg.text}
            <span className="chat-timestamp" style={{ color: msg.sender === "user" ? "rgba(255,255,255,0.6)" : "var(--muted)" }}>
              {msg.time}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="chat-typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-row">
        <input 
          type="text" 
          placeholder="Ask about your health..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          autoFocus
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
