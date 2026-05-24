"use client";

import React, { useState } from "react";

// Premium outline SVG icons for the sidebar
const HomeIcon = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-19.5 0A2.25 2.25 0 0 0 4.5 15h15a2.25 2.25 0 0 0 2.25-2.25m-19.5 0v.25A2.25 2.25 0 0 0 4.5 17.5h15a2.25 2.25 0 0 0 2.25-2.25v-.25m-19.5 0V9M2.25 9V7.5A2.25 2.25 0 0 1 4.5 5.25h4.18c.613 0 1.18.3 1.52.812l1.26 1.884A1.125 1.125 0 0 0 12.38 8.5H19.5A2.25 2.25 0 0 1 21.75 10.75V12" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-.554-8.243-1.596m16.502 0A12.067 12.067 0 0 1 12 11.75c-2.917 0-5.597-.506-8.03-1.412m16.06 0c.085-.386.13-.788.13-1.201a8.97 8.97 0 0 0-1.89-5.466m-12.43 5.466C3.92 8.413 3.875 8.01 3.875 7.6c0-1.996.65-3.84 1.757-5.334" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M19 12H9m10 0-3-3m3 3-3 3" />
  </svg>
);

const ChevronDownIcon = ({ isOpen }) => (
  <svg
    className={`w-3.5 h-3.5 opacity-55 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

export default function Sidebar({ theme, activeTab, setActiveTab, onLogout }) {
  // Collapsible accordion states
  const [contentOpen, setContentOpen] = useState(true);
  const [socialOpen, setSocialOpen] = useState(true);

  // Helper to determine active background classes
  const getButtonClass = (tabId) => {
    const isSelected = activeTab === tabId;
    return `w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer ${
      isSelected
        ? theme === "dark"
          ? "bg-[#27272a] text-[#ffffff]"
          : "bg-[#e4e4e7] text-[#09090b]"
        : theme === "dark"
        ? "text-neutral-400 hover:bg-[#18181b] hover:text-[#ffffff]"
        : "text-neutral-600 hover:bg-neutral-100 hover:text-[#09090b]"
    }`;
  };

  const getSubItemClass = (tabId) => {
    const isSelected = activeTab === tabId;
    return `relative w-full flex items-center px-4 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
      isSelected
        ? theme === "dark"
          ? "text-[#ffffff]"
          : "text-[#09090b]"
        : theme === "dark"
        ? "text-neutral-400 hover:text-[#ffffff]"
        : "text-neutral-600 hover:text-[#09090b]"
    }`;
  };

  return (
    <aside
      className={`w-64 h-full flex flex-col border-r transition-colors duration-500 select-none ${
        theme === "dark"
          ? "bg-[#09090b] border-[#27272a] text-neutral-200"
          : "bg-white border-neutral-200 text-neutral-800"
      }`}
    >
      {/* Sidebar Header/Logo (Matching shadcn screenshot) */}
      <div className="p-5 flex items-center gap-3 border-b border-neutral-200 dark:border-[#27272a]">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
          </svg>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold tracking-tight">Rishi Dev</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-50">Admin Console</span>
        </div>
      </div>

      {/* Sidebar Scrollable Navigation Area */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        
        {/* Section: Main Core */}
        <div className="space-y-1">
          <button onClick={() => setActiveTab("dashboard")} className={getButtonClass("dashboard")}>
            <div className="flex items-center gap-2.5">
              <HomeIcon />
              <span>Dashboard</span>
            </div>
          </button>
        </div>

        {/* Section: Content Management (Accordion with vertical guide line tree structure) */}
        <div className="space-y-1">
          <button
            onClick={() => setContentOpen(!contentOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider opacity-65 hover:opacity-100 transition-opacity cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <FolderIcon />
              <span>Content Management</span>
            </div>
            <ChevronDownIcon isOpen={contentOpen} />
          </button>

          {/* Sub-item tree collapsible folder */}
          {contentOpen && (
            <div className="relative pl-6 mt-1 flex flex-col space-y-1">
              {/* Thin Vertical Guideline Tree Indicator (Screenshot reference match!) */}
              <div className="absolute left-3.5 top-1 bottom-2 w-[1px] bg-neutral-200 dark:bg-neutral-800" />

              {/* Sub items */}
              {["About", "Skills", "Experience", "Projects", "Testimonials"].map((subItem) => {
                const tabId = subItem.toLowerCase();
                const isSelected = activeTab === tabId;
                return (
                  <button key={subItem} onClick={() => setActiveTab(tabId)} className={getSubItemClass(tabId)}>
                    {/* Small horizontal anchor block */}
                    {isSelected && (
                      <div className="absolute -left-[10px] w-2 h-[1px] bg-neutral-900 dark:bg-white" />
                    )}
                    <span>{subItem}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Social & Contact */}
        <div className="space-y-1">
          <button
            onClick={() => setSocialOpen(!socialOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider opacity-65 hover:opacity-100 transition-opacity cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <ShareIcon />
              <span>Social & Contact</span>
            </div>
            <ChevronDownIcon isOpen={socialOpen} />
          </button>

          {socialOpen && (
            <div className="relative pl-6 mt-1 flex flex-col space-y-1">
              {/* Vertical Guide Line */}
              <div className="absolute left-3.5 top-1 bottom-2 w-[1px] bg-neutral-200 dark:bg-neutral-800" />

              <button onClick={() => setActiveTab("sociallinks")} className={getSubItemClass("sociallinks")}>
                {activeTab === "sociallinks" && <div className="absolute -left-[10px] w-2 h-[1px] bg-neutral-900 dark:bg-white" />}
                <span>Social Links</span>
              </button>

              <button onClick={() => setActiveTab("contactinfo")} className={getSubItemClass("contactinfo")}>
                {activeTab === "contactinfo" && <div className="absolute -left-[10px] w-2 h-[1px] bg-neutral-900 dark:bg-white" />}
                <span>Contact Info</span>
              </button>
            </div>
          )}
        </div>

        {/* Section: Utilities & Configuration */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-45">Preferences</div>
          
          <button onClick={() => setActiveTab("medialibrary")} className={getButtonClass("medialibrary")}>
            <div className="flex items-center gap-2.5">
              <ImageIcon />
              <span>Media Library</span>
            </div>
          </button>

          <button onClick={() => setActiveTab("seosettings")} className={getButtonClass("seosettings")}>
            <div className="flex items-center gap-2.5">
              <GlobeIcon />
              <span>SEO Settings</span>
            </div>
          </button>

          <button onClick={() => setActiveTab("analytics")} className={getButtonClass("analytics")}>
            <div className="flex items-center gap-2.5">
              <ChartIcon />
              <span>Analytics</span>
            </div>
          </button>

          <button onClick={() => setActiveTab("messages")} className={getButtonClass("messages")}>
            <div className="flex items-center gap-2.5">
              <MessageIcon />
              <span>Messages / Contact</span>
            </div>
          </button>

          <button onClick={() => setActiveTab("adminsettings")} className={getButtonClass("adminsettings")}>
            <div className="flex items-center gap-2.5">
              <SettingsIcon />
              <span>Admin Settings</span>
            </div>
          </button>
        </div>
      </nav>

      {/* Sidebar Footer Logout Container */}
      <div className="p-4 border-t border-neutral-200 dark:border-[#27272a]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-500/10 active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <LogoutIcon />
          <span>Logout Portal</span>
        </button>
      </div>
    </aside>
  );
}
