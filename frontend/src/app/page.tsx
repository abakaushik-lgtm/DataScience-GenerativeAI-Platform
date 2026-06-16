"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuraAnalystChat from "@/components/AuraAnalystChat";
import InsightsDashboard from "./dashboard/page";
import AdvancedMLDashboard from "./advanced-ml/page";
import DataExplorer from "./data-explorer/page";
import SettingsView from "@/components/SettingsView";

function MainAppContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "chat";

  switch (view) {
    case "dashboard":
      return <InsightsDashboard />;
    case "advanced-ml":
      return <AdvancedMLDashboard />;
    case "data-explorer":
      return <DataExplorer />;
    case "settings":
      return <SettingsView />;
    case "chat":
    default:
      return <AuraAnalystChat />;
  }
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center bg-[#0a0a0f] text-[#f0f0f5]" style={{ height: '100%' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#6366f1]" size={32} />
          <p className="text-sm text-[#9ea3b0]">Loading Aura Analyst...</p>
        </div>
      </div>
    }>
      <MainAppContent />
    </Suspense>
  );
}
