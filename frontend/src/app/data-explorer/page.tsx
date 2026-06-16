"use client";

import { useState } from "react";
import { Database, FileText, Filter, Search, Download, ChevronRight, Hash, Type, Calendar, AlignLeft } from "lucide-react";

// Mock Data Definitions
const DATASETS = [
  {
    id: "sales_data_q3",
    name: "sales_data_q3.csv",
    type: "csv",
    rows: 12450,
    columns: 5,
    lastUpdated: "2 hours ago",
    schema: [
      { name: "transaction_id", type: "string", icon: <Type size={14} /> },
      { name: "date", type: "datetime", icon: <Calendar size={14} /> },
      { name: "product_category", type: "string", icon: <Type size={14} /> },
      { name: "revenue", type: "number", icon: <Hash size={14} /> },
      { name: "units_sold", type: "number", icon: <Hash size={14} /> }
    ],
    data: [
      { transaction_id: "TRX-8921", date: "2023-08-12", product_category: "Electronics", revenue: 1299.99, units_sold: 1 },
      { transaction_id: "TRX-8922", date: "2023-08-12", product_category: "Software", revenue: 49.99, units_sold: 3 },
      { transaction_id: "TRX-8923", date: "2023-08-13", product_category: "Furniture", revenue: 450.00, units_sold: 2 },
      { transaction_id: "TRX-8924", date: "2023-08-14", product_category: "Electronics", revenue: 899.50, units_sold: 1 },
      { transaction_id: "TRX-8925", date: "2023-08-14", product_category: "Accessories", revenue: 24.99, units_sold: 5 },
      { transaction_id: "TRX-8926", date: "2023-08-15", product_category: "Electronics", revenue: 199.00, units_sold: 2 },
      { transaction_id: "TRX-8927", date: "2023-08-16", product_category: "Software", revenue: 299.00, units_sold: 1 },
    ]
  },
  {
    id: "prod_users",
    name: "users_table",
    type: "postgres",
    rows: 842000,
    columns: 4,
    lastUpdated: "Live",
    schema: [
      { name: "user_id", type: "integer", icon: <Hash size={14} /> },
      { name: "email", type: "string", icon: <Type size={14} /> },
      { name: "signup_date", type: "datetime", icon: <Calendar size={14} /> },
      { name: "status", type: "string", icon: <Type size={14} /> }
    ],
    data: [
      { user_id: 1042, email: "a.kaushik@example.com", signup_date: "2022-01-14", status: "active" },
      { user_id: 1043, email: "m.smith@example.com", signup_date: "2022-01-15", status: "churned" },
      { user_id: 1044, email: "a.lee@example.com", signup_date: "2022-01-15", status: "active" },
      { user_id: 1045, email: "k.jones@example.com", signup_date: "2022-01-16", status: "active" },
      { user_id: 1046, email: "r.taylor@example.com", signup_date: "2022-01-18", status: "pending" },
    ]
  }
];

export default function DataExplorer() {
  const [activeDatasetId, setActiveDatasetId] = useState(DATASETS[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const activeDataset = DATASETS.find(d => d.id === activeDatasetId) || DATASETS[0];

  return (
    <div className="flex h-full bg-[#0a0a0f] text-[#f0f0f5]">
      
      {/* Sidebar: Datasets & Schema */}
      <div className="w-80 border-r border-[#ffffff14] bg-[#13141c] flex flex-col h-full flex-shrink-0">
        <div className="p-5 border-b border-[#ffffff14]">
          <h2 className="text-lg font-semibold tracking-wide">Data Hub</h2>
          <p className="text-xs text-[#9ea3b0] mt-1">Manage connected sources</p>
        </div>

        <div className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs uppercase text-[#6b7280] font-semibold tracking-widest mb-3">Active Datasets</h3>
          
          {DATASETS.map((ds) => (
            <button
              key={ds.id}
              onClick={() => setActiveDatasetId(ds.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                activeDatasetId === ds.id 
                ? "bg-[#6366f1]/10 border-[#6366f1]/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                : "bg-[#1c1d29] border-[#ffffff14] hover:border-[#6366f1]/30 hover:bg-[#1c1d29]/80"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-medium text-sm">
                  {ds.type === 'csv' ? <FileText size={16} className="text-[#f59e0b]" /> : <Database size={16} className="text-[#3b82f6]" />}
                  {ds.name}
                </div>
                {activeDatasetId === ds.id && <ChevronRight size={16} className="text-[#6366f1]" />}
              </div>
              <div className="text-xs text-[#9ea3b0] ml-6">
                {ds.rows.toLocaleString()} rows • {ds.columns} cols
              </div>
            </button>
          ))}

          {/* Schema Viewer for Active Dataset */}
          <div className="mt-8">
            <h3 className="text-xs uppercase text-[#6b7280] font-semibold tracking-widest mb-3">Schema: {activeDataset.name}</h3>
            <div className="bg-[#1c1d29] rounded-lg border border-[#ffffff14] overflow-hidden">
              {activeDataset.schema.map((col, i) => (
                <div key={col.name} className="flex items-center justify-between p-3 border-b border-[#ffffff14] last:border-0 hover:bg-[#ffffff0a] transition-colors">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#9ea3b0]">{col.icon}</span>
                    <span className="font-medium text-[#f0f0f5]">{col.name}</span>
                  </div>
                  <div className="text-xs text-[#6b7280] uppercase bg-[#13141c] px-2 py-0.5 rounded border border-[#ffffff14]">
                    {col.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Data Grid */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f]">
        
        {/* Toolbar */}
        <div className="h-16 border-b border-[#ffffff14] px-6 flex items-center justify-between bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input 
                type="text" 
                placeholder={`Search in ${activeDataset.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1c1d29] border border-[#ffffff14] rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] w-72 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 text-sm px-4 py-2 bg-[#1c1d29] border border-[#ffffff14] rounded-md hover:bg-[#ffffff0a] transition text-[#9ea3b0] hover:text-[#f0f0f5]">
              <Filter size={16} /> Filter
            </button>
          </div>
          <button className="flex items-center gap-2 text-sm px-4 py-2 bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 rounded-md hover:bg-[#6366f1]/20 transition font-medium">
            <Download size={16} /> Export View
          </button>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="bg-[#13141c] rounded-xl border border-[#ffffff14] shadow-2xl overflow-hidden flex flex-col max-h-full">
            
            {/* Table Header Row */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm whitespace-nowrap table-fixed">
                <thead className="text-xs uppercase bg-[#0a0a0a] text-[#a1a1aa] sticky top-0 z-10 shadow-sm border-b border-[#ffffff14]">
                  <tr>
                    {activeDataset.schema.map((col) => (
                      <th key={col.name} className={`px-6 py-4 font-semibold tracking-wider ${(col.type === "number" || col.type === "integer") ? "text-right" : "text-left"}`}>
                        <div className={`flex items-center gap-2 ${(col.type === "number" || col.type === "integer") ? "justify-end" : "justify-start"}`}>
                          {col.icon} {col.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ffffff0a]">
                  {activeDataset.data.filter(row => 
                    Object.values(row).some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase()))
                  ).map((row, idx) => (
                    <tr key={idx} className={`${idx % 2 === 0 ? "bg-[#121212]" : "bg-[#0a0a0a]"} hover:bg-[#2563eb]/10 transition-colors group`}>
                      {activeDataset.schema.map((col) => (
                        <td key={col.name} className={`px-6 py-3.5 text-[#ffffff] group-hover:text-white ${(col.type === "number" || col.type === "integer") ? "text-right" : "text-left"}`}>
                          {col.type === "number" || col.type === "integer" 
                            ? <span className="text-[#10b981] font-mono">{row[col.name as keyof typeof row]}</span>
                            : String(row[col.name as keyof typeof row])
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                  {activeDataset.data.length === 0 && (
                     <tr>
                       <td colSpan={activeDataset.schema.length} className="px-6 py-12 text-center text-[#6b7280]">
                          No records found matching "{searchQuery}"
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Footer */}
            <div className="border-t border-[#ffffff14] bg-[#1c1d29] px-6 py-3 flex items-center justify-between text-xs text-[#9ea3b0] mt-auto">
              <div>
                Showing 1 to {activeDataset.data.length} of {activeDataset.rows.toLocaleString()} entries
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded bg-[#13141c] border border-[#ffffff14] hover:bg-[#ffffff0a] disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1.5 rounded bg-[#13141c] border border-[#ffffff14] hover:bg-[#ffffff0a]">Next</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
