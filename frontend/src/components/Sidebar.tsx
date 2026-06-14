"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  TrendingUp, 
  Cpu, 
  FileText,
  Database,
  Activity,
  Upload
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [kbFile, setKbFile] = useState<File | null>(null);
  const [uploadingKb, setUploadingKb] = useState(false);

  const handleKbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setKbFile(selectedFile);
      setUploadingKb(true);
      // Mock upload delay for UI
      setTimeout(() => setUploadingKb(false), 1500);
    }
  };

  const navLinks = [
    { name: "AI Analyst", href: "/", icon: <MessageSquare size={18} /> },
    { name: "RAG Knowledge", href: "/?mode=rag", icon: <BookOpen size={18} /> },
    { name: "Executive Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Forecasting", href: "/dashboard#forecasting", icon: <TrendingUp size={18} /> },
    { name: "AutoML Engine", href: "/dashboard#automl", icon: <Cpu size={18} /> },
    { name: "Advanced ML Studio", href: "/advanced-ml", icon: <Activity size={18} /> },
    { name: "AI Reports", href: "/dashboard#reports", icon: <FileText size={18} /> },
  ];

  return (
    <aside className="w-64 border-r border-[#ffffff14] bg-[#13141c] p-6 hidden md:flex flex-col h-full flex-shrink-0 z-10 shadow-xl">
      <h1 className="text-2xl font-bold gradient-text mb-8 tracking-wider">AntiGravity</h1>
      
      <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <h2 className="text-xs uppercase text-[#6b7280] font-semibold tracking-widest mb-4 mt-2">Platform</h2>
        
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                isActive 
                  ? "bg-[#6366f1]/10 text-[#6366f1] shadow-[inset_2px_0_0_#6366f1]" 
                  : "text-[#9ea3b0] hover:bg-[#1c1d29] hover:text-[#f0f0f5]"
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Data Sources Config */}
      <div className="mt-4 pt-4 border-t border-[#ffffff14]">
        <h2 className="text-xs uppercase text-[#6b7280] font-semibold tracking-widest mb-3">Data Sources</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-[#f0f0f5] bg-[#1c1d29] p-2 rounded-md border border-[#ffffff14]">
            <Database size={14} className="text-[#3b82f6]" /> Prod_PostgreSQL
          </div>
          <div className="flex items-center gap-2 text-sm text-[#f0f0f5] bg-[#1c1d29] p-2 rounded-md border border-[#ffffff14]">
            <Database size={14} className="text-[#10b981]" /> Sales_Data.csv
          </div>
        </div>
      </div>

      {/* Knowledge Base Upload */}
      <div className="glass-panel p-4 mt-4 border border-[#ffffff14] rounded-xl relative group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/5 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center cursor-pointer">
          <input
            type="file"
            accept=".pdf,.txt,.md"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleKbUpload}
          />
          {uploadingKb ? (
            <div className="w-5 h-5 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mb-2"></div>
          ) : (
            <Upload size={20} className="text-[#10b981] mb-2 group-hover:-translate-y-1 transition-transform" />
          )}
          <span className="text-xs font-semibold text-[#f0f0f5]">
            {kbFile ? kbFile.name : "Upload Documents"}
          </span>
          <span className="text-[10px] text-[#6b7280] mt-1">PDF, TXT, MD up to 50MB</span>
        </div>
      </div>
    </aside>
  );
}
