"use client";

import { useState } from "react";
import { Sparkles, X, Send, Loader2, Code, FileCode } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI Copilot. Ask me to generate Python/SQL, explain charts, or recommend ML models!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // In a real app, you would pass the current Redux/Context state here (e.g. chartData)
      const contextData = { current_view: window.location.pathname };
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/api/copilot/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg.content, context_data: contextData })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection to Copilot Engine failed." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all transform hover:scale-110 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles size={24} />
      </button>

      {/* Copilot Window */}
      <div 
        className={`fixed bottom-6 right-6 w-[400px] h-[600px] bg-[#0a0a0f] border border-[#ffffff14] rounded-2xl shadow-2xl flex flex-col z-50 transition-all transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#ffffff14] bg-[#13141c] rounded-t-2xl">
          <div className="flex items-center gap-2 text-[#f0f0f5]">
            <Sparkles className="text-[#6366f1]" size={20} />
            <h3 className="font-semibold">AI Copilot</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-[#9ea3b0] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl p-3 text-sm ${msg.role === "user" ? "bg-[#3b82f6] text-white" : "bg-[#1c1d29] text-[#f0f0f5] border border-[#ffffff14]"}`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-[#1c1d29] border border-[#ffffff14] rounded-xl p-3 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-[#6366f1] rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-1.5 h-1.5 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               </div>
             </div>
          )}
        </div>

        {/* Action Suggestions */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto custom-scrollbar">
           <button onClick={() => setInput("Generate a Python script to train an XGBoost model.")} className="whitespace-nowrap text-xs bg-[#1c1d29] border border-[#ffffff14] text-[#9ea3b0] hover:text-white px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
             <FileCode size={12} /> Generate Python
           </button>
           <button onClick={() => setInput("Write a SQL query to calculate a 7-day rolling average.")} className="whitespace-nowrap text-xs bg-[#1c1d29] border border-[#ffffff14] text-[#9ea3b0] hover:text-white px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
             <Code size={12} /> Write SQL
           </button>
        </div>

        {/* Input */}
        <div className="p-4 bg-[#13141c] rounded-b-2xl border-t border-[#ffffff14]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Copilot..."
              className="w-full bg-[#0a0a0f] border border-[#ffffff14] rounded-full py-2.5 pl-4 pr-12 text-sm text-[#f0f0f5] placeholder-[#6b7280] focus:outline-none focus:border-[#6366f1]"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`absolute right-1 p-2 rounded-full ${input.trim() ? 'text-[#6366f1] hover:bg-[#1c1d29]' : 'text-[#6b7280]'}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
