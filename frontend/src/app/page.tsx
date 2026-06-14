"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { LayoutDashboard, Loader2, Send, Upload, BookOpen } from "lucide-react";
import ReactECharts from "echarts-for-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql?: string;
  data?: any[];
  chart_config?: any;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AntiGravity Data Analyst. You can ask me to query your structured databases, or upload PDFs to my Knowledge Base and ask me questions about your unstructured documents!",
    },
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState<"SQL" | "RAG">("SQL");
  
  const [kbFile, setKbFile] = useState<File | null>(null);
  const [uploadingKb, setUploadingKb] = useState(false);

  const handleKbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setKbFile(selectedFile);
      setUploadingKb(true);
      
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch("http://localhost:8000/api/rag/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `Knowledge Base Updated: Successfully ingested ${selectedFile.name} (${data.chunks_added || 'Mock'} chunks). Switch to RAG Knowledge Base mode to chat with it.` 
        }]);
      } catch (error) {
        console.error("Knowledge Base upload failed", error);
      } finally {
        setUploadingKb(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!query.trim()) return;

    const userMessage: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const endpoint = chatMode === "SQL" ? "http://localhost:8000/api/analyst/query" : "http://localhost:8000/api/rag/query";
      const body: any = { question: userMessage.content };
      
      if (chatMode === "SQL") {
        body.schema_info = "CREATE TABLE sales (id INT, product VARCHAR, amount FLOAT, region VARCHAR, date DATE);";
        body.db_type = "mock";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.explanation || "Request processed.",
        sql: data.sql_query,
        data: data.results,
        chart_config: data.chart_config,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error connecting to the backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#ffffff14] bg-[#13141c] p-6 hidden md:flex flex-col">
        <h1 className="text-2xl font-bold gradient-text mb-8 tracking-wider">AntiGravity</h1>
        <div className="space-y-4 flex-1">
          <h2 className="text-sm uppercase text-[#6b7280] font-semibold tracking-widest mb-4">Data Sources</h2>
          <div className="glass-panel p-3 cursor-pointer hover:bg-[#1c1d29] transition-colors">
            📊 Sales_Data.csv
          </div>
          <div className="glass-panel p-3 cursor-pointer hover:bg-[#1c1d29] transition-colors">
            🐘 Prod_PostgreSQL
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 w-full">
            Ask RAG Copilot
          </button>

          <a 
            href="/advanced-ml"
            className="block text-center mt-4 border border-indigo-600 text-indigo-400 hover:bg-indigo-600/10 font-bold py-3 px-6 rounded-lg transition-all duration-300 w-full"
          >
            Open Advanced ML Studio
          </a>
        </div>

        {/* Knowledge Base Configuration */}
        <div className="glass-panel p-5 mt-4 border-t border-[#ffffff14]">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-[#10b981]" size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7280]">Knowledge Base</h2>
          </div>
          
          <div className="relative group cursor-pointer w-full flex items-center justify-center p-4 border border-dashed border-[#ffffff14] rounded-lg hover:border-[#10b981] transition-all bg-[#0a0a0f]">
            <input
              type="file"
              accept=".pdf,.txt,.md"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleKbUpload}
            />
            <div className="flex flex-col items-center gap-2 text-[#9ea3b0] group-hover:text-[#10b981]">
              {uploadingKb ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              <span className="text-xs font-medium text-center">{kbFile ? kbFile.name : "Upload PDF / Doc"}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-6 border-t border-[#ffffff14]">
          <Link href="/dashboard" className="glass-panel p-3 flex items-center justify-center gap-2 hover:bg-[#1c1d29] transition-colors text-[#10b981] font-semibold">
            <LayoutDashboard size={18} /> View Insights Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b border-[#ffffff14] flex items-center px-6 glass-panel rounded-none">
          <h2 className="font-semibold text-lg">AI Data Analyst</h2>
          <div className="ml-auto flex items-center gap-2 text-sm text-[#10b981]">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            System Online
          </div>
        </header>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Chat Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#1c1d29] p-1 rounded-lg inline-flex border border-[#ffffff14]">
              <button 
                onClick={() => setChatMode("SQL")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${chatMode === "SQL" ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-[#9ea3b0] hover:text-white'}`}
              >
                SQL Analyst
              </button>
              <button 
                onClick={() => setChatMode("RAG")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${chatMode === "RAG" ? 'bg-[#10b981] text-white shadow-lg' : 'text-[#9ea3b0] hover:text-white'}`}
              >
                RAG Knowledge Base
              </button>
            </div>
          </div>

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
              <div
                className={`max-w-[80%] rounded-2xl p-5 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)]"
                    : "glass-panel"
                }`}
              >
                <div className="font-medium text-[15px] leading-relaxed">{msg.content}</div>
                
                {msg.sql && (
                  <div className="mt-4 bg-[#0a0a0f] p-3 rounded-md border border-[#ffffff14]">
                    <span className="text-xs text-[#9ea3b0] uppercase tracking-wider block mb-2">Generated SQL</span>
                    <code className="text-[#10b981] font-mono text-sm block overflow-x-auto whitespace-pre">
                      {msg.sql}
                    </code>
                  </div>
                )}
                
                {msg.chart_config && (
                  <div className="mt-4 bg-[#13141c] p-4 rounded-md border border-[#ffffff14] h-[300px] w-full">
                    <ReactECharts option={msg.chart_config} style={{ height: '100%', width: '100%' }} />
                  </div>
                )}
                
                {msg.data && msg.data.length > 0 && (
                  <div className="mt-4 overflow-x-auto border border-[#ffffff14] rounded-md">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-[#9ea3b0] uppercase bg-[#13141c]">
                        <tr>
                          {Object.keys(msg.data[0]).map((key) => (
                            <th key={key} className="px-4 py-2">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.data.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-b border-[#ffffff14] last:border-0 hover:bg-[#1c1d29]">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-4 py-2">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="glass-panel rounded-2xl p-5 flex items-center gap-2 text-[#9ea3b0]">
                <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={chatMode === "SQL" ? "Ask a question about your structured database..." : "Ask a question about your uploaded documents..."}
              className="w-full bg-[#1c1d29] border border-[#ffffff14] rounded-full py-4 pl-6 pr-16 text-[#f0f0f5] placeholder-[#6b7280] focus:outline-none focus:border-[#3b82f6] transition-all shadow-inner"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !query.trim()}
              className={`absolute right-2 p-3 rounded-full transition-all ${
                query.trim() ? (chatMode === "SQL" ? 'bg-[#3b82f6] hover:bg-[#2563eb]' : 'bg-[#10b981] hover:bg-[#059669]') : 'bg-[#2a2b36] text-[#6b7280]'
              }`}
            >
              {loading ? <Loader2 size={18} className="animate-spin text-white" /> : <Send size={18} className={query.trim() ? "text-white" : ""} />}
            </button>
          </div>
          <div className="text-center text-xs text-[#6b7280] mt-3">
            AntiGravity AI Analyst can make mistakes. Verify critical business insights.
          </div>
        </div>
      </main>
    </div>
  );
}
