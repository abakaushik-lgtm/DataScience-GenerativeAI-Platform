"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Send, Activity, TrendingUp, Paperclip, Zap, AlertTriangle } from "lucide-react";
import ReactECharts from "echarts-for-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql?: string;
  data?: any[];
  chart_config?: any;
}

export default function AuraAnalystChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") as "SQL" | "RAG";
  const [chatMode, setChatMode] = useState<"SQL" | "RAG">(
    initialMode === "RAG" ? "RAG" : "SQL"
  );
  
  const [kbFile, setKbFile] = useState<File | null>(null);
  const [uploadingKb, setUploadingKb] = useState(false);

  useEffect(() => {
    if (initialMode === "RAG" || initialMode === "SQL") {
      setChatMode(initialMode);
    }
  }, [initialMode]);

  const handleKbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setKbFile(selectedFile);
      setUploadingKb(true);
      
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(`${apiUrl}/api/rag/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `Knowledge Base Updated: Successfully Ingested ${selectedFile.name} (${data.chunks_added || 'Mock'} chunks). Switch to RAG Knowledge Base mode to query.` 
        }]);
        alert("Dataset uploaded successfully! Switch to RAG mode to use it.");
      } catch (error) {
        console.error("Knowledge Base upload failed", error);
      } finally {
        setUploadingKb(false);
      }
    }
  };

  const handleSendMessage = async (textOverride?: string | React.MouseEvent | React.KeyboardEvent) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : query;
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const endpoint = chatMode === "SQL" ? `${apiUrl}/api/analyst/query` : `${apiUrl}/api/rag/query`;
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
    <div className="flex flex-col relative h-full" style={{ paddingLeft: '24px', paddingRight: '24px', height: '100%', overflow: 'hidden' }}>
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative custom-scrollbar">
        {/* Floating Pill Toggle */}
        <div className="flex justify-center mb-8 sticky top-0 z-20 w-full px-4">
          <div 
            className="bg-[#1c1d29]/90 backdrop-blur-md rounded-full border border-[#ffffff14] shadow-xl flex items-center shrink-0"
            style={{ padding: '6px', gap: '8px' }}
          >
            <button 
              onClick={() => setChatMode("SQL")}
              className={`rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0 ${chatMode === "SQL" ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(79,70,229,0.4)]' : 'text-[#9ea3b0] hover:text-[#f0f0f5] hover:bg-[#ffffff0a]'}`}
              style={{ cursor: 'pointer', padding: '8px 20px' }}
            >
              SQL Analyst
            </button>
            <button 
              onClick={() => setChatMode("RAG")}
              className={`rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0 ${chatMode === "RAG" ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)]' : 'text-[#9ea3b0] hover:text-[#f0f0f5] hover:bg-[#ffffff0a]'}`}
              style={{ cursor: 'pointer', padding: '8px 20px' }}
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
              <div className="font-medium text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              
              {msg.sql && (
                <div className="mt-4 bg-[#0a0a0f] p-3 rounded-md border border-[#ffffff14]">
                  <span className="text-xs text-[#9ea3b0] uppercase tracking-wider block mb-2 font-mono">Generated SQL</span>
                  <code className="text-[#10b981] font-mono text-sm block overflow-x-auto whitespace-pre custom-scrollbar">
                    {msg.sql}
                  </code>
                </div>
              )}
              
              {msg.chart_config && (
                <div className="mt-4 bg-[#13141c] p-4 rounded-md border border-[#ffffff14] h-[260px] w-full overflow-hidden">
                  <ReactECharts option={msg.chart_config} style={{ height: '100%', width: '100%' }} />
                </div>
              )}
              
              {msg.data && msg.data.length > 0 && (
                <div className="mt-4 overflow-x-auto border border-[#ffffff14] rounded-md custom-scrollbar">
                  <table className="w-full text-sm whitespace-nowrap table-fixed">
                    <thead className="text-xs uppercase bg-[#050505] text-[#a1a1aa]">
                      <tr>
                        {Object.keys(msg.data[0]).map((key) => (
                          <th key={key} className={`px-4 py-3 font-semibold tracking-wider border-b border-[#ffffff14] ${typeof msg.data![0][key] === "number" ? "text-right" : "text-left"}`}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ffffff0a]">
                      {msg.data.slice(0, 5).map((row, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? "bg-[#121212]" : "bg-[#0a0a0a]"} hover:bg-[#2563eb]/10 transition-colors`}>
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className={`px-4 py-2 ${typeof val === "number" ? "text-right text-[#10b981] font-mono" : "text-left text-[#ffffff]"}`}>{String(val)}</td>
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
          <div className="mt-4 animate-fade-in space-y-6 max-w-4xl mx-auto w-full px-4 flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.4)] mb-1">
              <Activity size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#f0f0f5] text-center w-full">How can I help you analyze your data today?</h1>
            <p className="text-[#9ea3b0] text-center max-w-xl mx-auto mb-4 leading-relaxed text-sm">
              Your AI-powered Data Analyst. Ask questions about structured <strong className="text-[#f0f0f5] font-semibold">Databases</strong> and <strong className="text-[#f0f0f5] font-semibold">CSV files</strong>, or query unstructured <strong className="text-[#f0f0f5] font-semibold">PDF documents</strong>.
            </p>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mb-4 px-2">
              <div className="bg-[#1c1d29]/80 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center justify-center text-center border border-[#ffffff14] hover:border-[#3b82f6]/40 transition-all shadow-md">
                <div className="text-2xl font-bold text-[#f0f0f5] mb-1 font-mono">12</div>
                <div className="text-[10px] font-semibold text-[#9ea3b0] uppercase tracking-wider mb-2">Total Data</div>
                <div className="text-[10px] text-[#10b981] font-medium bg-[#10b981]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp size={10} /> +3 week
                </div>
              </div>
              
              <div className="bg-[#1c1d29]/80 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center justify-center text-center border border-[#ffffff14] hover:border-[#10b981]/40 transition-all shadow-md">
                <div className="text-2xl font-bold text-[#f0f0f5] mb-1 font-mono">84</div>
                <div className="text-[10px] font-semibold text-[#9ea3b0] uppercase tracking-wider mb-2">Reports Gen</div>
                <div className="text-[10px] text-[#10b981] font-medium bg-[#10b981]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp size={10} /> +12 wk
                </div>
              </div>
              
              <div className="bg-[#1c1d29]/80 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center justify-center text-center border border-[#ffffff14] hover:border-[#8b5cf6]/40 transition-all shadow-md">
                <div className="text-2xl font-bold text-[#f0f0f5] mb-1 font-mono">17</div>
                <div className="text-[10px] font-semibold text-[#9ea3b0] uppercase tracking-wider mb-2">Models</div>
                <div className="text-[10px] text-[#10b981] font-medium bg-[#10b981]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp size={10} /> +2 wk
                </div>
              </div>
              
              <div className="bg-[#1c1d29]/80 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center justify-center text-center border border-[#ffffff14] hover:border-[#f59e0b]/40 transition-all shadow-md">
                <div className="text-2xl font-bold text-[#f0f0f5] mb-1 font-mono">320</div>
                <div className="text-[10px] font-semibold text-[#9ea3b0] uppercase tracking-wider mb-2">Knowledge</div>
                <div className="text-[10px] text-[#10b981] font-medium bg-[#10b981]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp size={10} /> +45 mo
                </div>
              </div>
            </div>

            {/* Suggested Actions */}
            <div className="max-w-2xl w-full" style={{ marginTop: '24px', marginBottom: '24px' }}>
              <div className="rounded-2xl shadow-lg transition-all" style={{ padding: '24px', background: 'linear-gradient(to bottom, #1c1d29, #13141c)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                  <Send size={16} className="text-[#3b82f6]" /> Suggested Actions
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
                  {[
                    { label: "Revenue Analysis", query: "Why did revenue decrease last quarter?" },
                    { label: "Forecast Q3", query: "Forecast next quarter sales based on seasonality" },
                    { label: "Customer Churn", query: "Find the most profitable customer segments and churn risks" },
                    { label: "Document Summary", query: "Summarize the key findings from the uploaded documents" }
                  ].map((item, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSendMessage(item.query)}
                      className="transition-all duration-200 text-xs font-semibold text-[#f0f0f5] shadow-sm inline-flex items-center gap-2"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        backgroundColor: '#1c1d29',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        cursor: 'pointer',
                        marginRight: '8px',
                        marginBottom: '4px'
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass-panel rounded-2xl p-4 flex items-center gap-2 text-[#9ea3b0]">
              <div className="w-1.5 h-1.5 bg-[#6366f1] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 max-w-3xl mx-auto w-full relative z-30" style={{ flexShrink: 0 }}>
        <div 
          className="relative transition-all duration-300"
          style={{
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(28, 29, 41, 0.75) 0%, rgba(19, 20, 28, 0.95) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask Aura Analyst anything..."
            rows={2}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              padding: '16px 20px',
              fontSize: '15px',
              color: '#f0f0f5',
              border: 'none',
              outline: 'none',
              resize: 'none',
            }}
            className="placeholder-[#6b7280] custom-scrollbar"
          />
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(28, 29, 41, 0.4)',
              borderBottomLeftRadius: '20px',
              borderBottomRightRadius: '20px'
            }}
          >
            <div className="flex items-center gap-4 ml-1">
              <label 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  backgroundColor: '#1c1d29',
                  color: '#9ea3b0',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input type="file" style={{ display: 'none' }} accept=".csv,.json,.xlsx,.pdf" onChange={handleKbUpload} />
                <Paperclip size={12} /> {uploadingKb ? "Uploading..." : (kbFile ? (kbFile.name.length > 15 ? kbFile.name.substring(0, 12) + '...' : kbFile.name) : "Upload")}
              </label>
              <div className="text-[10px] text-[#6b7280] hidden sm:block">
                 Press <kbd className="bg-[#2a2b36] border border-[#ffffff14] px-1 py-0.5 rounded text-[9px]">Enter</kbd> to query, <kbd className="bg-[#2a2b36] border border-[#ffffff14] px-1 py-0.5 rounded text-[9px]">Shift + Enter</kbd> for new line
              </div>
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !query.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: query.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
                backgroundColor: query.trim() 
                  ? (chatMode === "SQL" ? '#3b82f6' : '#10b981') 
                  : '#2a2b36',
                boxShadow: query.trim()
                  ? (chatMode === "SQL" 
                    ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                    : '0 4px 12px rgba(16, 185, 129, 0.3)')
                  : 'none'
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin text-white" /> : <Send size={16} className={query.trim() ? "text-white" : ""} />}
            </button>
          </div>
        </div>
        <div className="text-center text-[10px] text-[#6b7280] mt-2 font-medium tracking-wide">
          Aura Analyst can make mistakes. Verify critical business insights.
        </div>
      </div>
    </div>
  );
}
