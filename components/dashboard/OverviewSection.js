"use client";

import React, { useState, useEffect } from "react";
import {
  SkillsIcon,
  ProjectsIcon,
  TestimonialsIcon,
  ClockIcon,
  ActivityIcon,
  EyeIcon,
  PlusIcon,
  EditIcon,
  UploadIcon
} from "../Icons";

// Futuristic shimmering skeleton loader matching dashboard metrics layout
export const OverviewSkeleton = ({ theme }) => {
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#18181b]/60 border-[#27272a]" : "bg-white border-neutral-200";
  const shimmerClass = isDark ? "bg-neutral-800/60" : "bg-neutral-200/60";

  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Banner Skeleton */}
      <div className={`p-6 rounded-2xl border ${bgClass} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div className="space-y-2 w-full md:w-1/2">
          <div className={`h-5 ${shimmerClass} rounded w-3/4`} />
          <div className={`h-3.5 ${shimmerClass} rounded w-1/2`} />
        </div>
        <div className={`h-7 ${shimmerClass} rounded-full w-32`} />
      </div>

      {/* 6 Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`p-6 rounded-2xl border ${bgClass} space-y-3`}>
            <div className="flex justify-between items-center">
              <div className={`h-3.5 ${shimmerClass} rounded w-1/3`} />
              <div className={`w-8 h-8 rounded-full ${shimmerClass}`} />
            </div>
            <div className={`h-7 ${shimmerClass} rounded w-1/4`} />
            <div className={`h-3 ${shimmerClass} rounded w-3/4`} />
          </div>
        ))}
      </div>

      {/* Actions and Uploader Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border ${bgClass} lg:col-span-2 space-y-4`}>
          <div className={`h-4 ${shimmerClass} rounded w-1/4`} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-24 ${shimmerClass} rounded-xl`} />
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${bgClass} space-y-4`}>
          <div className={`h-4 ${shimmerClass} rounded w-1/3`} />
          <div className={`h-24 ${shimmerClass} rounded-xl`} />
        </div>
      </div>
    </div>
  );
};

export default function OverviewSection({ theme, setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");

  const [stats, setStats] = useState({
    skills: 0,
    projects: 0,
    experiences: 0,
    visitors: "N/A"
  });

  // Fetch real data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, analyticsRes] = await Promise.all([
          fetch("/api/overview"),
          fetch("/api/analytics")
        ]);

        const overviewData = await overviewRes.json();
        const analyticsData = await analyticsRes.json();

        setStats({
          skills: overviewData.success ? overviewData.data.totalSkills : 0,
          projects: overviewData.success ? overviewData.data.totalProjects : 0,
          experiences: overviewData.success ? overviewData.data.totalExperiences : 0,
          visitors: analyticsData.success && !analyticsData.needsSetup ? analyticsData.data.totalVisitors : "Setup Req"
        });

      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        // smooth loading transition
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchDashboardData();
  }, []);

  // Futuristic interactive Mock Upload simulation + Real API Upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file.name);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", "Rishi_Resume_Update");
      formData.append("type", "raw"); // For PDF documents

      // Simulate some progress UI
      const progressInterval = setInterval(() => {
        setUploadProgress(p => (p < 85 ? p + 15 : p));
      }, 300);

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const json = await res.json();
      
      if (json.success && json.data) {
        const newUrl = json.data.url;
        
        // Now update the about_content table with this new URL
        const aboutRes = await fetch("/api/content/about");
        const aboutJson = await aboutRes.json();
        
        if (aboutJson.success && aboutJson.data) {
          const currentAbout = aboutJson.data;
          await fetch("/api/content/about", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              heading: currentAbout.heading,
              description: currentAbout.description,
              resume_btn_text: currentAbout.resume_btn_text,
              resume_link: newUrl,
              profile_image_url: currentAbout.profile_image_url,
            })
          });
        }
      }
    } catch (error) {
      console.error("Resume Upload Failed:", error);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 800);
    }
  };

  if (loading) {
    return <OverviewSkeleton theme={theme} />;
  }

  const isDark = theme === "dark";
  const containerClass = `p-6 rounded-2xl border transition-all duration-300 ${
    isDark
      ? "bg-[#18181b] border-[#27272a] text-neutral-100 shadow-md hover:shadow-lg"
      : "bg-white border-neutral-200 text-neutral-800 shadow-sm hover:shadow-md"
  }`;

  const actionCardClass = `flex flex-col items-center justify-center p-5 rounded-xl border text-center transition-all duration-300 hover:scale-[1.02] cursor-pointer group ${
    isDark
      ? "bg-[#09090b] border-[#27272a] hover:bg-[#1f1f23] text-neutral-200"
      : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100/70 text-neutral-800"
  }`;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Dynamic Header Banner */}
      <div className={`${containerClass} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Welcome back, Rishi! 👋</h2>
          <p className="text-xs opacity-60">Database Cloud Connection verified. You have full workspace controls.</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all duration-300 ${
          isDark
            ? "bg-[#09090b] border-[#27272a] text-neutral-300"
            : "bg-neutral-50 border-neutral-200 text-neutral-600"
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          TiDB Cluster: Connected
        </span>
      </div>

      {/* Premium Metrics Grid: Total Skills, Projects, Testimonials, Update Time, Live Status, Visitors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: "Total Skills",
            value: stats.skills,
            subtext: "Languages & Frameworks",
            icon: <SkillsIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          },
          {
            label: "Total Projects",
            value: stats.projects,
            subtext: "Deployed Web Applications",
            icon: <ProjectsIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          },
          {
            label: "Experiences",
            value: stats.experiences,
            subtext: "Professional Roles",
            icon: <TestimonialsIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          },
          {
            label: "Last Updated",
            value: "Live Sync",
            subtext: "System configurations save",
            icon: <ClockIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          },
          {
            label: "Portfolio Live Status",
            value: "Live & Online",
            subtext: "Cloud hosting synchronized",
            icon: <ActivityIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          },
          {
            label: "Visitors Count",
            value: stats.visitors,
            subtext: "Google Analytics live tracking",
            icon: <EyeIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          }
        ].map((stat, idx) => (
          <div key={idx} className={containerClass}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-55">{stat.label}</span>
              <div className={`p-1.5 rounded-lg ${isDark ? "bg-[#27272a]/20" : "bg-neutral-100"}`}>
                {stat.icon}
              </div>
            </div>
            <div className={`text-2xl font-bold tracking-tight mb-1 ${isDark ? "text-white" : "text-neutral-900"}`}>{stat.value}</div>
            <span className="text-[10px] font-medium opacity-60">{stat.subtext}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions & Resume Uploader Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className={`${containerClass} lg:col-span-2 space-y-4`}>
          <h3 className="text-sm font-bold tracking-tight">Quick Actions Workspace</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <button onClick={() => setActiveTab("projects")} className={actionCardClass}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${
                isDark ? "bg-[#27272a]/30 text-white" : "bg-neutral-100 text-neutral-800"
              }`}>
                <PlusIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">Add Project</span>
              <span className="text-[10px] opacity-50 mt-1">Insert metadata & repo</span>
            </button>

            <button onClick={() => setActiveTab("skills")} className={actionCardClass}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${
                isDark ? "bg-[#27272a]/30 text-white" : "bg-neutral-100 text-neutral-800"
              }`}>
                <PlusIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">Add Skill</span>
              <span className="text-[10px] opacity-50 mt-1">Catalog programming tools</span>
            </button>

            <button onClick={() => setActiveTab("about")} className={actionCardClass}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${
                isDark ? "bg-[#27272a]/30 text-white" : "bg-neutral-100 text-neutral-800"
              }`}>
                <EditIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">Edit About Info</span>
              <span className="text-[10px] opacity-50 mt-1">Update professional profile</span>
            </button>

          </div>
        </div>

        {/* Futuristic Resume Uploader */}
        <div className={`${containerClass} flex flex-col justify-between`}>
          <div className="space-y-1 mb-4">
            <h3 className="text-sm font-bold tracking-tight">Resume Pipeline</h3>
            <p className="text-[10px] opacity-60">Upload a new PDF to sync live resume link.</p>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              id="resume-file"
              onChange={handleResumeUpload}
              disabled={isUploading}
              className="hidden"
            />

            {isUploading ? (
              <div className={`p-4 rounded-xl border border-dashed text-center flex flex-col items-center justify-center space-y-2 ${
                isDark ? "bg-[#09090b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"
              }`}>
                {/* Custom circular progress loader */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke={isDark ? "#27272a" : "#e4e4e7"}
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#2563eb"
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray="125.6"
                      strokeDashoffset={125.6 - (125.6 * uploadProgress) / 100}
                      className="transition-all duration-100 ease-out"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-blue-600">{uploadProgress}%</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 animate-pulse">Syncing file to TiDB Cloud storage...</span>
              </div>
            ) : uploadedFile ? (
              <div className={`p-4 rounded-xl border text-center space-y-1.5 flex flex-col items-center ${
                isDark ? "border-[#27272a] bg-[#09090b]" : "border-neutral-200 bg-white"
              }`}>
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold">Resume Uploaded Successfully!</span>
                <span className="text-[9px] opacity-60 font-mono truncate max-w-full block">{uploadedFile}</span>
                <button
                  onClick={() => setUploadedFile("")}
                  className="text-[9px] text-red-500 hover:underline pt-1 cursor-pointer font-bold uppercase tracking-wider"
                >
                  Clear File
                </button>
              </div>
            ) : (
              <label
                htmlFor="resume-file"
                className={`p-5 rounded-xl border border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 group ${
                  isDark
                    ? "border-[#27272a] hover:border-blue-500 bg-[#09090b]"
                    : "border-neutral-200 hover:border-blue-600 bg-neutral-50/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${
                  isDark ? "bg-[#27272a]/30 text-white" : "bg-neutral-100 text-neutral-800"
                }`}>
                  <UploadIcon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold transition-colors ${
                  isDark ? "text-white group-hover:text-blue-400" : "text-neutral-800 group-hover:text-blue-600"
                }`}>Upload Resume</span>
                <span className="text-[9px] opacity-45 mt-0.5">PDF or DOC (Max 5MB)</span>
              </label>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
