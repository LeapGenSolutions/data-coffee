import React, { useState, useRef, useEffect } from 'react';

const funReplies = [
  "I'm here to help! 😃",
  "That sounds interesting! Tell me more! 🤔",
  "Let's solve it together! 🚀",
  "Haha, good one! 😂",
  "I'm your friendly AI assistant! 🤖",
  "Need a break? How about a joke? 😜"
];

function getRandomReply(userMsg) {
  if (userMsg.toLowerCase().includes('joke')) {
    return "Why did the computer go to the doctor? Because it had a virus! 🦠";
  }
  return funReplies[Math.floor(Math.random() * funReplies.length)];
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm your AI Copilot 🤖. Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    setTimeout(() => {
      setMessages(msgs => [...msgs, { from: 'bot', text: getRandomReply(input) }]);
    }, 700);
    setInput('');
  };

  return (
    <div>
      {/* Floating Button */}
      <button
        className="fixed z-50 bottom-6 right-6 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:scale-110 transition-transform"
        onClick={() => setOpen(o => !o)}
        aria-label="Open chatbot"
      >
        {open ? '✖️' : '💬'}
      </button>
      {/* Chat Window */}
      {open && (
        <div className="fixed z-50 bottom-24 right-6 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border-2 border-blue-200 flex flex-col animate-fade-in">
          <div className="bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-t-2xl px-4 py-3 flex items-center gap-2">
            <span className="text-lg">🤖 Fun Copilot</span>
            <span className="ml-auto text-xs opacity-80">AI Chatbot</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-blue-50" style={{ maxHeight: 320 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm shadow ${msg.from === 'user' ? 'bg-gradient-to-br from-blue-200 to-blue-100 text-gray-900' : 'bg-white text-purple-700 border border-blue-200'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex items-center p-3 border-t border-blue-100 bg-white rounded-b-2xl">
            <input
              className="flex-1 rounded-full px-4 py-2 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-blue-50"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button
              className="ml-2 bg-gradient-to-br from-purple-400 to-blue-400 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl shadow hover:scale-110 transition-transform animate-bounce"
              onClick={handleSend}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
    </div>
  );
} 