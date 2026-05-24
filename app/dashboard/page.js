"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import OverviewSection from "@/components/dashboard/OverviewSection";
import WorkspaceSection from "@/components/dashboard/WorkspaceSection";

export default function DashboardPage() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminEmail] = useState("admin@rishi.com");

  const handleLogout = () => {
    // Destroy JWT cookie and redirect smoothly to landing login page (Zero alerts used!)
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = "/";
  };

  // Helper to format breadcrumbs based on active tab
  const getBreadcrumbs = () => {
    switch (activeTab) {
      case "dashboard":
        return ["Console", "Overview"];
      case "about":
      case "skills":
      case "experience":
      case "projects":
      case "testimonials":
        return ["Console", "Content Management", activeTab.charAt(0).toUpperCase() + activeTab.slice(1)];
      case "sociallinks":
      case "contactinfo":
        return ["Console", "Social & Contact", activeTab === "sociallinks" ? "Social Links" : "Contact Info"];
      case "medialibrary":
        return ["Console", "Preferences", "Media Library"];
      case "seosettings":
        return ["Console", "Preferences", "SEO Settings"];
      case "analytics":
        return ["Console", "Preferences", "Analytics"];
      case "messages":
        return ["Console", "Preferences", "Messages"];
      case "adminsettings":
        return ["Console", "Preferences", "Admin Settings"];
      default:
        return ["Console", "Workspace"];
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`h-screen w-full overflow-hidden flex transition-colors duration-500 ${
        isDark ? "bg-[#09090b] text-[#fafafa]" : "bg-[#fafafa] text-[#09090b]"
      }`}
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 1. Left Premium Sidebar (Accordion collapse, tree indicators & active tabs) */}
      <Sidebar
        theme={theme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* 2. Right Main Content Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Main Workspace Header bar */}
        <header className={`px-6 py-4 flex items-center justify-between border-b transition-colors duration-500 ${
          isDark ? "border-[#27272a] bg-[#09090b]" : "border-neutral-200 bg-white"
        }`}>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs font-semibold opacity-60">
            {getBreadcrumbs().map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="opacity-40">&rarr;</span>}
                <span className={i === getBreadcrumbs().length - 1 ? "opacity-100" : ""}>{b}</span>
              </span>
            ))}
          </div>

          {/* Top Header Utilities */}
          <div className="flex items-center gap-4">
            {/* Theme switcher button */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`p-1.5 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                isDark ? "bg-[#18181b] border-[#27272a] text-[#ffffff]" : "bg-neutral-100 border-neutral-200 text-[#09090b]"
              }`}
              title="Toggle Theme"
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.95 4.95l1.59 1.59m10.92 10.92 1.59 1.59M3 12h2.25m13.5 0H21M4.95 19.05l1.59-1.59m10.92-10.92 1.59-1.59M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </button>

            {/* Profile Avatar Badge */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
              isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-100 border-neutral-200"
            }`}>
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                A
              </div>
              <span className="text-[10px] font-bold tracking-tight opacity-75">{adminEmail}</span>
            </div>
          </div>
        </header>

        {/* Scrollable workspace content */}
        <main className={`flex-1 overflow-y-auto p-6 transition-colors duration-500 ${
          isDark ? "bg-[#09090b]" : "bg-[#fafafa]"
        }`}>
          <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            {activeTab === "dashboard" ? (
              <OverviewSection theme={theme} setActiveTab={setActiveTab} />
            ) : (
              <WorkspaceSection theme={theme} activeTab={activeTab} />
            )}
          </div>
        </main>
        
        {/* Portal target for fixed save buttons */}
        <div id="save-button-portal" className="shrink-0 z-50"></div>
      </div>
    </div>
  );
}
