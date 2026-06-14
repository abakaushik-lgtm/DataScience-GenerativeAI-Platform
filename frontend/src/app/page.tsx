"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { LayoutDashboard, Loader2, Send, Upload, BookOpen, Activity, Database, FileText, Cpu, TrendingUp } from "lucide-react";
import ReactECharts from "echarts-for-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql?: string;
  data?: any[];
  chart_config?: any;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
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

  const handleSendMessage = async (textOverride?: string | React.MouseEvent | React.KeyboardEvent) => {
    // If textOverride is a string, use it, otherwise use query state
    const textToSend = typeof textOverride === 'string' ? textOverride : query;
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: "user", content: textToSend };
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
    <div className="flex flex-col relative h-full">
        {/* Header */}
        <header className="h-16 border-b border-[#ffffff14] flex items-center px-6 glass-panel rounded-none">
          <div className="flex flex-col justify-center">
            <span className="text-xl font-bold tracking-tight text-[#f0f0f5]">AntiGravity</span>
            <span className="text-[10px] text-[#3b82f6] font-semibold tracking-widest uppercase">Enterprise AI Analytics Platform</span>
          </div>
          <div className="mx-5 h-8 w-px bg-[#ffffff14]"></div>
          <h2 className="text-sm font-medium text-[#9ea3b0]">AI Data Analyst</h2>
          <div className="ml-auto flex items-center gap-2 text-sm text-[#10b981]">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            System Online
          </div>
        </header>

        {/* Global Mode Switcher */}
        <div className="flex justify-center items-center py-5 border-b border-[#ffffff0a] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex gap-8">
            <button 
              onClick={() => setChatMode("SQL")}
              className={`px-8 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 border ${chatMode === "SQL" ? 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/50 shadow-[0_0_25px_rgba(59,130,246,0.35)]' : 'bg-transparent text-[#6b7280] border-transparent hover:bg-[#1c1d29] hover:text-[#f0f0f5]'}`}
            >
              SQL Analyst
            </button>
            <button 
              onClick={() => setChatMode("RAG")}
              className={`px-8 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 border ${chatMode === "RAG" ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/50 shadow-[0_0_25px_rgba(16,185,129,0.35)]' : 'bg-transparent text-[#6b7280] border-transparent hover:bg-[#1c1d29] hover:text-[#f0f0f5]'}`}
            >
              RAG Knowledge Base
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
              <div
                className={`max-w-[80%] rounded-2xl p-5 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)]"
                    : "glass-panel"
                }`}
              >
                <div className="font-medium text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                
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

          {/* Empty State / Dashboard Home */}
          {messages.length === 0 && !loading && (
            <div className="mt-8 animate-fade-in space-y-8 max-w-5xl mx-auto w-full flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.4)] mb-2 mt-4">
                <Activity size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-[#f0f0f5] mb-2">Welcome to AntiGravity</h1>
              <p className="text-[#9ea3b0] text-center max-w-lg mb-8 leading-relaxed">
                Your AI-powered Data Analyst. Ask questions about your structured <strong className="text-[#f0f0f5] font-semibold">Databases</strong> and <strong className="text-[#f0f0f5] font-semibold">CSV files</strong>, or query unstructured <strong className="text-[#f0f0f5] font-semibold">PDF documents</strong> and <strong className="text-[#f0f0f5] font-semibold">Business metrics</strong>.
              </p>

              {/* Hero Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4 w-full">
                <div className="bg-gradient-to-b from-[#1c1d29] to-[#13141c] p-6 rounded-3xl flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-default relative overflow-hidden group shadow-xl ring-1 ring-white/5">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-3 bg-[#3b82f6]/10 rounded-xl text-[#3b82f6] mb-3 relative z-10"><Database size={24} /></div>
                  <div className="text-3xl font-bold text-[#f0f0f5] relative z-10">12</div>
                  <div className="text-xs text-[#9ea3b0] font-semibold uppercase tracking-wider mt-1 mb-4 relative z-10">Total Datasets</div>
                  <div className="text-[11px] text-[#10b981] font-medium bg-[#10b981]/10 border border-[#10b981]/20 px-2.5 py-1 rounded-full flex items-center gap-1 relative z-10">
                    <TrendingUp size={12} /> +3 this week
                  </div>
                </div>
                
                <div className="bg-gradient-to-b from-[#1c1d29] to-[#13141c] p-6 rounded-3xl flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-default relative overflow-hidden group shadow-xl ring-1 ring-white/5">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-3 bg-[#10b981]/10 rounded-xl text-[#10b981] mb-3 relative z-10"><FileText size={24} /></div>
                  <div className="text-3xl font-bold text-[#f0f0f5] relative z-10">84</div>
                  <div className="text-xs text-[#9ea3b0] font-semibold uppercase tracking-wider mt-1 mb-4 relative z-10">Reports Generated</div>
                  <div className="text-[11px] text-[#10b981] font-medium bg-[#10b981]/10 border border-[#10b981]/20 px-2.5 py-1 rounded-full flex items-center gap-1 relative z-10">
                    <TrendingUp size={12} /> +12 this week
                  </div>
                </div>
                
                <div className="bg-gradient-to-b from-[#1c1d29] to-[#13141c] p-6 rounded-3xl flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-default relative overflow-hidden group shadow-xl ring-1 ring-white/5">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#8b5cf6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-3 bg-[#8b5cf6]/10 rounded-xl text-[#8b5cf6] mb-3 relative z-10"><Cpu size={24} /></div>
                  <div className="text-3xl font-bold text-[#f0f0f5] relative z-10">17</div>
                  <div className="text-xs text-[#9ea3b0] font-semibold uppercase tracking-wider mt-1 mb-4 relative z-10">Models Trained</div>
                  <div className="text-[11px] text-[#10b981] font-medium bg-[#10b981]/10 border border-[#10b981]/20 px-2.5 py-1 rounded-full flex items-center gap-1 relative z-10">
                    <TrendingUp size={12} /> +2 this week
                  </div>
                </div>
                
                <div className="bg-gradient-to-b from-[#1c1d29] to-[#13141c] p-6 rounded-3xl flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-default relative overflow-hidden group shadow-xl ring-1 ring-white/5">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#f59e0b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-3 bg-[#f59e0b]/10 rounded-xl text-[#f59e0b] mb-3 relative z-10"><BookOpen size={24} /></div>
                  <div className="text-3xl font-bold text-[#f0f0f5] relative z-10">320</div>
                  <div className="text-xs text-[#9ea3b0] font-semibold uppercase tracking-wider mt-1 mb-4 relative z-10">Knowledge Docs</div>
                  <div className="text-[11px] text-[#10b981] font-medium bg-[#10b981]/10 border border-[#10b981]/20 px-2.5 py-1 rounded-full flex items-center gap-1 relative z-10">
                    <TrendingUp size={12} /> +45 this month
                  </div>
                </div>
              </div>

              {/* Sample Prompts & Recent */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="bg-gradient-to-b from-[#1c1d29] to-[#13141c] p-8 rounded-3xl shadow-xl ring-1 ring-white/5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Send size={18} className="text-[#3b82f6]" /> Suggested Actions
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Revenue Analysis", query: "Why did revenue decrease last quarter?" },
                      { label: "Forecast Q3", query: "Forecast next quarter sales based on seasonality" },
                      { label: "Customer Churn", query: "Find the most profitable customer segments and churn risks" },
                      { label: "Document Summary", query: "Summarize the key findings from the uploaded documents" }
                    ].map((item, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSendMessage(item.query)}
                        className="px-5 py-2.5 rounded-full bg-[#0a0a0f] ring-1 ring-[#ffffff14] hover:ring-[#3b82f6] hover:bg-[#3b82f6]/10 transition-all text-sm font-medium text-[#9ea3b0] hover:text-[#3b82f6] shadow-sm"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-b from-[#1c1d29] to-[#13141c] p-8 rounded-3xl shadow-xl ring-1 ring-white/5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-[#10b981]" /> Active Datasets
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#1c1d29] border border-[#ffffff14]">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#10b981]/10 rounded-md text-[#10b981]"><LayoutDashboard size={16}/></div>
                        <div>
                          <div className="text-sm font-medium">sales_data_q3.csv</div>
                          <div className="text-xs text-[#6b7280]">12,450 rows • 1.2 MB</div>
                        </div>
                      </div>
                      <div className="text-xs text-[#10b981] px-2 py-1 bg-[#10b981]/10 rounded-full">Active</div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#1c1d29] border border-[#ffffff14]">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#f59e0b]/10 rounded-md text-[#f59e0b]"><BookOpen size={16}/></div>
                        <div>
                          <div className="text-sm font-medium">Q2_Earnings_Call.pdf</div>
                          <div className="text-xs text-[#6b7280]">Vectorized • 345 chunks</div>
                        </div>
                      </div>
                      <div className="text-xs text-[#f59e0b] px-2 py-1 bg-[#f59e0b]/10 rounded-full">Indexed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
        <div className="p-6 max-w-4xl mx-auto w-full">
          <div className="relative bg-[#1c1d29] border border-[#ffffff14] rounded-2xl shadow-xl focus-within:border-[#6366f1] focus-within:ring-1 focus-within:ring-[#6366f1]/50 transition-all">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask AntiGravity anything..."
              rows={3}
              className="w-full bg-transparent p-4 text-[#f0f0f5] placeholder-[#6b7280] resize-none focus:outline-none custom-scrollbar"
            />
            <div className="flex justify-between items-center p-3 border-t border-[#ffffff0a]">
              <div className="text-xs text-[#6b7280] ml-2">
                 Press <kbd className="bg-[#2a2b36] border border-[#ffffff14] px-1.5 py-0.5 rounded text-[10px]">Enter</kbd> to send, <kbd className="bg-[#2a2b36] border border-[#ffffff14] px-1.5 py-0.5 rounded text-[10px]">Shift + Enter</kbd> for new line
              </div>
              <button
                onClick={handleSendMessage}
                disabled={loading || !query.trim()}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  query.trim() ? (chatMode === "SQL" ? 'bg-[#3b82f6] hover:bg-[#2563eb] shadow-md' : 'bg-[#10b981] hover:bg-[#059669] shadow-md') : 'bg-[#2a2b36] text-[#6b7280]'
                }`}
              >
                {loading ? <Loader2 size={18} className="animate-spin text-white" /> : <Send size={18} className={query.trim() ? "text-white" : ""} />}
              </button>
            </div>
          </div>
          <div className="text-center text-xs text-[#6b7280] mt-4">
            AntiGravity AI Analyst can make mistakes. Verify critical business insights.
          </div>
        </div>
      </div>
  );
}
