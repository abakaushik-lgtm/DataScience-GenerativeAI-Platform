"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { LayoutDashboard, Loader2, Send, Upload, BookOpen, Activity } from "lucide-react";
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
    <div className="flex flex-col relative h-full">
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
          <div className="flex justify-center mb-8">
            <div className="bg-[#13141c] p-1.5 rounded-xl inline-flex border border-[#ffffff14] shadow-inner w-full max-w-md">
              <button 
                onClick={() => setChatMode("SQL")}
                className={`flex-1 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${chatMode === "SQL" ? 'bg-[#3b82f6] text-white shadow-md transform scale-[1.02]' : 'text-[#9ea3b0] hover:text-[#f0f0f5] hover:bg-[#1c1d29]'}`}
              >
                SQL Analyst
              </button>
              <button 
                onClick={() => setChatMode("RAG")}
                className={`flex-1 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${chatMode === "RAG" ? 'bg-[#10b981] text-white shadow-md transform scale-[1.02]' : 'text-[#9ea3b0] hover:text-[#f0f0f5] hover:bg-[#1c1d29]'}`}
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

          {/* Empty State / Dashboard Home */}
          {messages.length === 1 && !loading && (
            <div className="mt-8 animate-fade-in space-y-8">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-5 border-l-4 border-l-[#10b981]">
                  <h3 className="text-[#9ea3b0] text-sm uppercase tracking-wider mb-2">Revenue Trends</h3>
                  <div className="text-2xl font-bold text-[#f0f0f5]">+24.5%</div>
                  <div className="text-xs text-[#10b981] mt-1">↑ vs last quarter</div>
                </div>
                <div className="glass-panel p-5 border-l-4 border-l-[#ef4444]">
                  <h3 className="text-[#9ea3b0] text-sm uppercase tracking-wider mb-2">Customer Churn</h3>
                  <div className="text-2xl font-bold text-[#f0f0f5]">4.2%</div>
                  <div className="text-xs text-[#ef4444] mt-1">↓ requires attention</div>
                </div>
                <div className="glass-panel p-5 border-l-4 border-l-[#3b82f6]">
                  <h3 className="text-[#9ea3b0] text-sm uppercase tracking-wider mb-2">Top Products</h3>
                  <div className="text-2xl font-bold text-[#f0f0f5]">Pro Tier</div>
                  <div className="text-xs text-[#3b82f6] mt-1">45% of total sales</div>
                </div>
              </div>

              {/* Sample Prompts & Recent */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#13141c] p-6 rounded-xl border border-[#ffffff14] hover:shadow-lg transition-all">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Send size={18} className="text-[#3b82f6]" /> Suggested Questions
                  </h3>
                  <div className="space-y-3">
                    {["Why did revenue decrease last quarter?", "Forecast next quarter sales based on seasonality", "Find the most profitable customer segments"].map((q, i) => (
                      <button 
                        key={i} 
                        onClick={() => setQuery(q)}
                        className="w-full text-left px-4 py-3 rounded-lg bg-[#1c1d29] border border-[#ffffff14] hover:border-[#3b82f6] hover:bg-[#252636] transition-all text-sm text-[#9ea3b0] hover:text-[#f0f0f5]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#13141c] p-6 rounded-xl border border-[#ffffff14] hover:shadow-lg transition-all">
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
      </div>
    </div>
  );
}
