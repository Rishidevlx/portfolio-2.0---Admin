"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import SkillsSection from "./SkillsSection";
import ExperienceSection from "./ExperienceSection";
import ProjectsSection from "./ProjectsSection";
import TestimonialsSection from "./TestimonialsSection";
import SocialLinksSection from "./SocialLinksSection";
import ContactInfoSection from "./ContactInfoSection";
import MediaLibrarySection from "./MediaLibrarySection";
import MediaPickerModal from "./MediaPickerModal";
import SeoSettingsSection from "./SeoSettingsSection";
import AnalyticsSection from "./AnalyticsSection";
import AdminSettingsSection from "./AdminSettingsSection";

// Futuristic shimmering skeleton for form controls and lists
export const FormSkeleton = ({ theme }) => {
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#18181b]/60 border-[#27272a]" : "bg-white border-neutral-200";
  const shimmerClass = isDark ? "bg-neutral-800/60" : "bg-neutral-200/60";

  return (
    <div className={`p-6 rounded-2xl border ${bgClass} space-y-6 animate-pulse select-none`}>
      {/* Header bar */}
      <div className="border-b border-neutral-200 dark:border-[#27272a]/55 pb-4 flex justify-between items-center gap-3">
        <div className="space-y-2 w-1/2">
          <div className={`h-5 ${shimmerClass} rounded w-1/2`} />
          <div className={`h-3 ${shimmerClass} rounded w-3/4`} />
        </div>
        <div className={`h-8 ${shimmerClass} rounded w-28`} />
      </div>

      {/* Main body content area skeleton */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className={`h-3 ${shimmerClass} rounded w-1/4`} />
              <div className={`h-10 ${shimmerClass} rounded-lg w-full`} />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className={`h-3 ${shimmerClass} rounded w-12`} />
          <div className={`h-24 ${shimmerClass} rounded-lg w-full`} />
        </div>
        <div className={`h-10 ${shimmerClass} rounded-lg w-full`} />
      </div>
    </div>
  );
};

export default function WorkspaceSection({ theme, activeTab }) {
  const [loading, setLoading] = useState(true);

  // About Section States
  const [aboutHeading, setAboutHeading] = useState("Behind the Developer");
  const [aboutDesc, setAboutDesc] = useState("");
  const [resumeBtnText, setResumeBtnText] = useState("Open my CV");
  const [resumeLink, setResumeLink] = useState("/assets/Rishi_Resume.pdf");
  const [profileImg, setProfileImg] = useState("./assets/images/about/Rishi Proffess pic.png");
  const [imgUploading, setImgUploading] = useState(false);
  const [aboutSaving, setAboutSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Skills Section logic has been moved to SkillsSection.js component for better modularity.

  // Trigger loading skeleton on tab changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Fetch About content from DB on mount
  useEffect(() => {
    if (activeTab !== "about") return;
    fetch("/api/content/about")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data;
          setAboutHeading(d.heading || "Behind the Developer");
          setAboutDesc(d.description || "");
          setResumeBtnText(d.resume_btn_text || "Open my CV");
          setResumeLink(d.resume_link || "/assets/Rishi_Resume.pdf");
          setProfileImg(d.profile_image_url || "./assets/images/about/Rishi Proffess pic.png");
        }
      })
      .catch(() => toast.error("Failed to load About content from database."));
  }, [activeTab]);

  // Save About content to DB
  const handleAboutSave = async (e) => {
    if (e) e.preventDefault();
    setAboutSaving(true);
    try {
      const res = await fetch("/api/content/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heading: aboutHeading,
          description: aboutDesc,
          resume_btn_text: resumeBtnText,
          resume_link: resumeLink,
          profile_image_url: profileImg,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("About section saved! Changes are now live on your portfolio.", {
          classNames: { icon: "text-green-500" },
        });
      } else {
        toast.error(json.error || "Failed to save about content.", {
          classNames: { icon: "text-destructive" },
        });
      }
    } catch {
      toast.error("Network error. Could not save about content.", {
        classNames: { icon: "text-destructive" },
      });
    } finally {
      setAboutSaving(false);
    }
  };

  // Handle Profile Image Upload via API
  const handleProfileImgChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImgUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("type", "image");

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      
      const json = await res.json();
      if (json.success && json.data) {
        setProfileImg(json.data.url);
        toast.info("Image uploaded successfully! Click 'Save Changes' to update your portfolio.", {
          classNames: { icon: "text-violet-500" },
        });
      } else {
        toast.error("Failed to upload image. Please try again.");
      }
    } catch (error) {
      toast.error("Network error during image upload.");
    } finally {
      setImgUploading(false);
    }
  };

  if (loading) {
    return <FormSkeleton theme={theme} />;
  }

  const isDark = theme === "dark";
  const containerClass = `p-6 rounded-2xl border transition-all duration-300 ${
    isDark
      ? "bg-[#18181b] border-[#27272a] text-neutral-100 shadow-md"
      : "bg-white border-neutral-200 text-neutral-800 shadow-sm"
  }`;
  
  const inputClass = `w-full px-3.5 py-2 rounded-lg border text-sm transition-all duration-300 outline-none focus:ring-2 ${
    isDark
      ? "bg-[#09090b] border-[#27272a] text-[#ffffff] focus:ring-[#3f3f46] focus:border-[#52525b]"
      : "bg-[#ffffff] border-[#d4d4d8] text-[#09090b] focus:ring-[#e4e4e7] focus:border-[#a1a1aa]"
  }`;

  const buttonClass = `px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
    isDark ? "bg-[#ffffff] border-[#ffffff] text-[#09090b]" : "bg-[#09090b] border-[#09090b] text-[#ffffff]"
  }`;

  const tabTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  // Custom Rendering for specific content sections
  const renderWorkspaceModule = () => {
    switch (activeTab) {
      case "about":
        return (
          <form onSubmit={handleAboutSave} className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Form Elements */}
              <div className="lg:col-span-2 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">About Heading</label>
                  <input
                    type="text"
                    value={aboutHeading}
                    onChange={(e) => setAboutHeading(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">About Biography</label>
                  <textarea
                    rows={6}
                    className={inputClass}
                    value={aboutDesc}
                    onChange={(e) => setAboutDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">Resume Button Text</label>
                    <input
                      type="text"
                      value={resumeBtnText}
                      onChange={(e) => setResumeBtnText(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">Resume File Link / Path</label>
                    <input
                      type="text"
                      value={resumeLink}
                      onChange={(e) => setResumeLink(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right Profile Image Selector Block */}
              <div className="flex flex-col items-center justify-between p-5 rounded-xl border border-neutral-200 dark:border-[#27272a] bg-neutral-50/50 dark:bg-[#09090b]/40">
                <div className="w-full text-center space-y-1 mb-4">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70 block">Profile Portrait</label>
                  <span className="text-[10px] opacity-50 block">Upload a high-quality biography photo</span>
                </div>

                {/* Profile Image Frame Preview */}
                <div className="relative w-40 h-44 rounded-xl overflow-hidden border border-neutral-200 dark:border-[#27272a] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center group mb-4">
                  {imgUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-[9px] font-bold text-blue-500 animate-pulse">Syncing...</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={profileImg}
                        alt="Rishi Profile Preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change Photo</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Portrait File Input */}
                <div className="w-full flex gap-2">
                  <label className="flex-1 block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImgChange}
                      disabled={imgUploading}
                      className="hidden"
                    />
                    <div className="w-full py-2 rounded-lg border border-dashed border-neutral-300 dark:border-[#27272a] hover:border-blue-500 dark:hover:border-blue-500 text-center text-xs font-semibold cursor-pointer transition-colors duration-200">
                      Upload File
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="flex-1 block w-full py-2 rounded-lg border border-dashed border-neutral-300 dark:border-[#27272a] hover:border-blue-500 dark:hover:border-blue-500 text-center text-xs font-semibold cursor-pointer transition-colors duration-200"
                  >
                    From Library
                  </button>
                </div>
              </div>

            </div>

            
            {typeof document !== 'undefined' && document.getElementById('save-button-portal') && createPortal(
              <div className={`p-4 border-t flex justify-end transition-colors duration-500 ${
                isDark ? "bg-[#09090b] border-[#27272a]" : "bg-[#fafafa] border-neutral-200"
              }`}>
                <button type="button" onClick={handleAboutSave} disabled={aboutSaving} className={`${buttonClass} bg-blue-600 border-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 shadow-lg px-8 py-2.5 !text-sm flex items-center gap-2`}>
                  {aboutSaving ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : "Save All Changes to Live Portfolio"}
                </button>
              </div>,
              document.getElementById('save-button-portal')
            )}
            
            {isMediaPickerOpen && (
              <MediaPickerModal 
                theme={theme}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={(media) => {
                  setProfileImg(media.url);
                  setIsMediaPickerOpen(false);
                }}
              />
            )}
          </form>
        );

      case "skills":
        return <SkillsSection theme={theme} inputClass={inputClass} buttonClass={buttonClass} />;

      case "experience":
        return <ExperienceSection theme={theme} inputClass={inputClass} buttonClass={buttonClass} />;

      case "projects":
        return <ProjectsSection theme={theme} inputClass={inputClass} buttonClass={buttonClass} />;

      case "testimonials":
        return <TestimonialsSection theme={theme} inputClass={inputClass} buttonClass={buttonClass} />;

      case "sociallinks":
        return <SocialLinksSection theme={theme} inputClass={inputClass} buttonClass={buttonClass} />;

      case "contactinfo":
        return <ContactInfoSection theme={theme} inputClass={inputClass} buttonClass={buttonClass} />;

      case "medialibrary":
        return <MediaLibrarySection theme={theme} inputClass={inputClass} buttonClass={buttonClass} />;

      case "seosettings":
        return <SeoSettingsSection theme={theme} inputClass={inputClass} buttonClass={buttonClass} />;

      case "analytics":
        return <AnalyticsSection theme={theme} inputClass={inputClass} buttonClass={buttonClass} />;

      case "messages":
        return (
          <div className="space-y-4">
            {[
              { from: "Aravind Swamy", email: "aravind@gmail.com", msg: "Hey Rishi, love your portfolio! Are you open for a freelance SaaS dashboard integration?", date: "2 hours ago" },
              { from: "Jennifer K.", email: "jennifer@techcorp.co", msg: "Hi Rishi, we reviewed your projects and would love to schedule a developer technical round interview this Friday.", date: "1 day ago" },
            ].map((m, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${
                isDark ? "bg-[#09090b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"
              } space-y-2`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold">{m.from} <span className="opacity-55 font-medium ml-1">({m.email})</span></span>
                  <span className="opacity-50">{m.date}</span>
                </div>
                <p className="text-xs opacity-75">{m.msg}</p>
                <div className="flex justify-end gap-3 pt-1">
                  <button type="button" className="text-xs text-blue-500 hover:underline">Reply</button>
                  <button type="button" className="text-xs text-red-500 hover:underline">Archive</button>
                </div>
              </div>
            ))}
          </div>
        );

      case "adminsettings":
        return <AdminSettingsSection theme={theme} inputClass={inputClass} buttonClass={buttonClass} />;

      default:
        // Generic dynamic preview card for other sections
        return (
          <div className="p-12 rounded-xl border border-dashed border-neutral-300 dark:border-[#27272a] text-center">
            <svg className="w-10 h-10 opacity-30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <h4 className="text-sm font-bold opacity-80 mb-1">No Entries Configured</h4>
            <p className="text-xs opacity-50 max-w-sm mx-auto mb-4">Click "Create New Entry" or select an item below to update your live portfolio content database.</p>
          </div>
        );
    }
  };

  return (
    <div className={containerClass}>
      <div className="border-b border-neutral-200 dark:border-[#27272a] pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight">{tabTitle} Management</h2>
          <p className="text-xs opacity-65">Add, update, or remove entries for the {tabTitle.toLowerCase()} portfolio section.</p>
        </div>
        
        {!["about", "seosettings", "analytics", "adminsettings", "skills", "experience", "projects", "testimonials", "sociallinks", "contactinfo", "medialibrary"].includes(activeTab) && (
          <button
            onClick={() => {
              // Safe and silent mock sync - zero alerts!
              console.log(`Action: Add new entry to ${tabTitle}`);
            }}
            className={buttonClass}
          >
            + Create New Entry
          </button>
        )}
      </div>

      {/* Futuristic workspace forms / tables */}
      <div className="space-y-5">
        {renderWorkspaceModule()}

        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>TiDB Integration Node: Read/Write pipeline configuration mapped for portfolio database connection.</span>
        </div>
      </div>
    </div>
  );
}
