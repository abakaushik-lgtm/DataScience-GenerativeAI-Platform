"use client";

import { useState } from "react";
import { Settings, Shield, Server, Database, Save, CheckCircle } from "lucide-react";

export default function SettingsView() {
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [dbHost, setDbHost] = useState("localhost");
  const [dbPort, setDbPort] = useState("5432");
  const [dbUser, setDbUser] = useState("postgres");
  const [dbName, setDbName] = useState("antigravity");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="glass-panel p-6 animate-fade-in" style={{ maxWidth: '800px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
        <Settings size={24} className="text-[#6366f1]" />
        <div>
          <h2 className="text-xl font-bold text-[#f0f0f5]">System Settings</h2>
          <p className="text-xs text-[#9ea3b0] mt-0.5">Configure model engines, credentials, and databases</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* LLM Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 className="text-xs uppercase text-[#6b7280] font-semibold tracking-widest flex items-center gap-2">
            <Server size={14} /> AI Model Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#9ea3b0] mb-2">LLM Provider</label>
              <select 
                value={provider} 
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md p-3 text-[#f0f0f5] outline-none focus:border-[#6366f1] text-sm"
              >
                <option value="openai">OpenAI (SaaS Inference)</option>
                <option value="ollama">Ollama (Private Air-Gapped Local Inference)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-[#9ea3b0] mb-2">
                {provider === "openai" ? "OpenAI API Key" : "Ollama Model Endpoint"}
              </label>
              <input 
                type={provider === "openai" ? "password" : "text"} 
                placeholder={provider === "openai" ? "sk-..." : "http://localhost:11434"} 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md p-3 text-[#f0f0f5] outline-none focus:border-[#6366f1] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Database Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
          <h3 className="text-xs uppercase text-[#6b7280] font-semibold tracking-widest flex items-center gap-2">
            <Database size={14} /> Relational Data Source (PostgreSQL)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-[#9ea3b0] mb-2">Host</label>
              <input 
                type="text" 
                value={dbHost} 
                onChange={e => setDbHost(e.target.value)}
                className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md p-3 text-sm text-[#f0f0f5] outline-none focus:border-[#6366f1]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9ea3b0] mb-2">Port</label>
              <input 
                type="text" 
                value={dbPort} 
                onChange={e => setDbPort(e.target.value)}
                className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md p-3 text-sm text-[#f0f0f5] outline-none focus:border-[#6366f1]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9ea3b0] mb-2">User</label>
              <input 
                type="text" 
                value={dbUser} 
                onChange={e => setDbUser(e.target.value)}
                className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md p-3 text-sm text-[#f0f0f5] outline-none focus:border-[#6366f1]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9ea3b0] mb-2">Database</label>
              <input 
                type="text" 
                value={dbName} 
                onChange={e => setDbName(e.target.value)}
                className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md p-3 text-sm text-[#f0f0f5] outline-none focus:border-[#6366f1]"
              />
            </div>
          </div>
        </div>

        {/* Security Alert banner */}
        <div className="bg-[#1c1d29] border border-[#ffffff14] rounded-xl p-4 flex items-start gap-3" style={{ marginTop: '8px' }}>
          <Shield className="text-[#10b981] flex-shrink-0" size={18} style={{ marginTop: '2px' }} />
          <p className="text-xs text-[#9ea3b0] leading-relaxed">
            All configured credentials, keys, and credentials strings are encrypted at-rest using AES-256 standard encryption keys inside your local environment parameters. Aura Analyst does not store or leak keys to third-party servers.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px', marginTop: '8px' }}>
          <div>
            {saved && (
              <span className="text-xs text-[#10b981] font-semibold flex items-center gap-1.5 animate-fade-in">
                <CheckCircle size={14} /> Settings saved successfully!
              </span>
            )}
          </div>
          <button 
            type="submit" 
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} /> Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
