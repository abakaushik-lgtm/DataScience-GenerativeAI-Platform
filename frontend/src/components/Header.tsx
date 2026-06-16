"use client";

import { Bell, Search, User, Menu } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function Header() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "chat";
  const mode = searchParams.get("mode") || "SQL";
  const tab = searchParams.get("tab") || "";

  const getPageTitle = () => {
    if (view === "chat") {
      if (mode === "RAG") return "RAG Knowledge";
      return "Aura Analyst";
    }
    if (view === "dashboard") {
      if (tab === "forecasting") return "Advanced Forecasting";
      if (tab === "automl") return "AutoML Lab Engine";
      if (tab === "reports") return "AI Reports";
      return "Executive Dashboard";
    }
    if (view === "advanced-ml") return "Advanced ML Studio";
    if (view === "data-explorer") return "Data Explorer Hub";
    if (view === "settings") return "Settings";
    return "Aura Analyst";
  };

  return (
    <header className="h-16 flex items-center justify-between bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#ffffff14] sticky top-0 z-40" style={{ paddingLeft: '64px', paddingRight: '64px' }}>
      <div className="flex items-center gap-4">
        {/* Mobile menu button - normally hidden on desktop since sidebar is fixed */}
        <button className="md:hidden text-[#9ea3b0] hover:text-white transition">
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold tracking-wide text-[#f0f0f5]">
          {getPageTitle()}
        </h2>
      </div>

      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingRight: '24px' }}
      >
        {/* Search Bar */}
        <div className="hidden md:flex relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] group-focus-within:text-primary transition" />
          <input 
            type="text" 
            placeholder="Search queries, models, or reports..." 
            className="bg-[#1c1d29] border border-[#ffffff14] rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all"
          />
        </div>

        {/* Notifications */}
        <button 
          className="relative text-[#9ea3b0] hover:text-white transition" 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full animate-pulse"></span>
        </button>

        {/* User Profile */}
        <div 
          className="cursor-pointer hover:opacity-80 transition" 
          style={{ 
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)', 
            paddingLeft: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(99,102,241,0.5)]">
            AK
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium text-[#f0f0f5]">Anubhuti Kaushik</p>
            <p className="text-xs text-[#6b7280]">Lead Data Scientist</p>
          </div>
        </div>
      </div>
    </header>
  );
}
