"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AnalyticsSection({ theme, inputClass, buttonClass }) {
  const isDark = theme === "dark";

  const [isLoading, setIsLoading] = useState(true);

  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then(res => res.json())
      .then(data => {
        if (data.needsSetup) {
          setNeedsSetup(true);
          setSetupError(data.error);
        } else if (data.success && data.data) {
          setAnalyticsData(data.data);
        } else {
          toast.error("Failed to load analytics data.");
        }
      })
      .catch(() => {
        toast.error("Network error fetching analytics.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading || (!analyticsData && !needsSetup)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 opacity-60">
        <svg className="animate-spin w-8 h-8 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="text-sm font-bold tracking-wider uppercase">Loading Real Analytics...</div>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className={`p-8 rounded-xl border flex flex-col items-center text-center ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-white border-neutral-200"}`}>
        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-black tracking-tight mb-2">Google Analytics Integration Setup</h3>
        <p className="text-sm opacity-70 max-w-lg mb-8">
          To fetch real live data, your admin backend needs the Google Service Account credentials. 
          Error returned: <span className="font-mono text-xs text-red-500">"{setupError}"</span>
        </p>

        <div className="text-left bg-blue-500/5 border border-blue-500/20 p-6 rounded-xl w-full max-w-2xl space-y-4">
          <h4 className="text-sm font-bold text-blue-500 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Setup Instructions
          </h4>
          <ol className="text-xs space-y-3 opacity-80 list-decimal list-inside font-medium leading-relaxed">
            <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-500 hover:underline">Google Cloud Console</a> and create a Service Account.</li>
            <li>Download the Service Account JSON key.</li>
            <li>Add that Service Account email as a <strong className="text-emerald-500">Viewer</strong> in your Google Analytics Property Access Management.</li>
            <li>For Vercel deployment, copy the ENTIRE content of the downloaded JSON file and paste it as the value for <code className="font-mono bg-black/10 dark:bg-white/10 px-1 rounded">GOOGLE_CREDENTIALS_JSON</code> in Vercel Environment Variables.</li>
            <li>Add these two variables:</li>
          </ol>
          <pre className={`p-4 rounded-lg text-[10px] font-mono overflow-x-auto ${isDark ? "bg-[#09090b] border border-[#27272a] text-emerald-400" : "bg-neutral-900 border-neutral-800 text-emerald-400"}`}>
            <code>
{`GA_PROPERTY_ID="123456789" (Your Property ID, not the G-XXX Measurement ID)
GOOGLE_CREDENTIALS_JSON='{ "type": "service_account", "project_id": "...", ... }'`}
            </code>
          </pre>
          <p className="text-xs opacity-60 italic mt-2">After adding these in Vercel, redeploy the app.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Visitors Card */}
        <div className={`p-6 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${isDark ? "bg-[#18181b] border-[#27272a] hover:border-blue-500/50" : "bg-white border-neutral-200 hover:border-blue-500/50"}`}>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">Total Visitors</h3>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black tracking-tighter">{analyticsData.totalVisitors}</span>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{analyticsData.visitorsGrowth}</span>
          </div>
          <p className="text-xs opacity-50 mt-2">Unique users since launch</p>
        </div>

        {/* Resume Downloads Card */}
        <div className={`p-6 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${isDark ? "bg-[#18181b] border-[#27272a] hover:border-emerald-500/50" : "bg-white border-neutral-200 hover:border-emerald-500/50"}`}>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">Resume Downloads</h3>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black tracking-tighter">{analyticsData.resumeDownloads}</span>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{analyticsData.resumeGrowth}</span>
          </div>
          <p className="text-xs opacity-50 mt-2">Active talent acquisition interest</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Overview */}
        <div className={`p-6 rounded-xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-white border-neutral-200"} flex flex-col`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold opacity-80">Traffic Overview</h3>
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Last 7 Days</span>
          </div>
          <div className="flex-1 flex items-end gap-2 h-40">
            {analyticsData.trafficData.map((val, idx) => {
              const max = Math.max(...analyticsData.trafficData);
              const heightPct = (val / max) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col justify-end items-center group">
                  <div className="w-full relative bg-blue-500/20 hover:bg-blue-500 transition-colors rounded-t-sm" style={{ height: `${heightPct}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-1 rounded transition-opacity pointer-events-none">
                      {val}
                    </div>
                  </div>
                  <div className="h-1 w-full bg-blue-500 mt-1 rounded-full opacity-50"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Click Tracking */}
        <div className={`p-6 rounded-xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-white border-neutral-200"}`}>
          <h3 className="text-sm font-bold opacity-80 mb-6">Click Tracking (Events)</h3>
          <div className="space-y-4">
            {analyticsData.clickTracking.map((item, idx) => (
              <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${isDark ? "bg-[#09090b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? "bg-[#18181b]" : "bg-white"} border ${isDark ? "border-[#27272a]" : "border-neutral-200"}`}>
                    <svg className="w-4 h-4 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-xs font-bold opacity-80">{item.label}</span>
                </div>
                <span className="text-sm font-black text-blue-500">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Projects Section */}
      <div className={`p-6 rounded-xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-white border-neutral-200"}`}>
        <h3 className="text-sm font-bold opacity-80 mb-6">Top Performing Projects</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={`border-b text-xs uppercase tracking-wider opacity-50 ${isDark ? "border-[#27272a]" : "border-neutral-200"}`}>
                <th className="pb-3 font-bold">Project Name</th>
                <th className="pb-3 font-bold">Total Views</th>
                <th className="pb-3 font-bold">External Clicks</th>
                <th className="pb-3 font-bold">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topProjects.map((project, idx) => {
                const engagement = Math.round((project.clicks / project.views) * 100);
                return (
                  <tr key={idx} className={`border-b last:border-0 transition-colors ${isDark ? "border-[#27272a] hover:bg-[#27272a]" : "border-neutral-200 hover:bg-neutral-50"}`}>
                    <td className="py-4 font-bold opacity-90 text-xs">{project.name}</td>
                    <td className="py-4 opacity-70 text-xs">{project.views}</td>
                    <td className="py-4 opacity-70 text-xs">{project.clicks}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-16 rounded-full overflow-hidden ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}>
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${engagement}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500">{engagement}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
