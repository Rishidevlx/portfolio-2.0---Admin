"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import MediaPickerModal from "./MediaPickerModal";

export default function SeoSettingsSection({ theme, inputClass, buttonClass }) {
  const portalRoot = typeof document !== 'undefined' ? document.getElementById('save-button-portal') : null;
  const isDark = theme === "dark";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [keywords, setKeywords] = useState("");
  const [sitemap, setSitemap] = useState("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetch("/api/content/seosettings")
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          const d = json.data;
          setMetaTitle(d.meta_title || "");
          setMetaDescription(d.meta_description || "");
          setOgImage(d.og_image || "");
          setKeywords(d.keywords || "");
          setSitemap(d.sitemap || "");
          setGoogleAnalyticsId(d.google_analytics_id || "");
        }
      })
      .catch(() => {
        // Fallback defaults if table is empty or error
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("Saving SEO settings...");

    try {
      const res = await fetch("/api/content/seosettings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_title: metaTitle,
          meta_description: metaDescription,
          og_image: ogImage,
          keywords: keywords,
          sitemap: sitemap,
          google_analytics_id: googleAnalyticsId
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("SEO settings saved successfully!", { id: toastId, classNames: { icon: "text-green-500" } });
      } else {
        toast.error(data.error || "Failed to save SEO settings.", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-sm opacity-60">Loading SEO Settings...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <form onSubmit={handleSave} className={`p-6 rounded-xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"} space-y-6`}>
        
        {/* Basic SEO Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70">Meta Title</label>
            <input 
              type="text" 
              value={metaTitle} 
              onChange={(e) => setMetaTitle(e.target.value)} 
              placeholder="e.g. Rishi Dev - Full Stack Engineer & Designer Portfolio" 
              className={inputClass} 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70">Meta Description</label>
            <textarea 
              rows={3}
              value={metaDescription} 
              onChange={(e) => setMetaDescription(e.target.value)} 
              placeholder="e.g. Explore the developer portfolio of Rishi Dev..." 
              className={inputClass} 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70">Keywords</label>
            <textarea 
              rows={2}
              value={keywords} 
              onChange={(e) => setKeywords(e.target.value)} 
              placeholder="e.g. Full Stack Developer, React, Next.js, Portfolio" 
              className={inputClass} 
            />
          </div>
        </div>

        {/* OG Image Selection */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-2">OG Image (Social Preview)</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className={`w-full sm:w-1/3 aspect-video rounded-xl overflow-hidden border flex items-center justify-center ${isDark ? "bg-neutral-900 border-[#27272a]" : "bg-white border-neutral-200"}`}>
              {ogImage ? (
                <img src={ogImage} alt="OG Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs opacity-40 font-semibold uppercase tracking-wider">No Image Selected</span>
              )}
            </div>
            
            <div className="w-full sm:w-2/3 flex flex-col gap-2">
               <input 
                 type="text" 
                 value={ogImage} 
                 onChange={(e) => setOgImage(e.target.value)} 
                 placeholder="Image URL" 
                 className={inputClass} 
               />
               <button
                 type="button"
                 onClick={() => setIsMediaPickerOpen(true)}
                 className={`w-full py-2.5 rounded-lg border border-dashed text-xs font-semibold text-center cursor-pointer transition-colors ${
                   isDark ? "border-[#27272a] hover:border-blue-500 bg-[#09090b]" : "border-neutral-300 hover:border-blue-500 bg-white"
                 }`}
               >
                 Browse Media Library
               </button>
            </div>
          </div>
        </div>

        {/* Advanced SEO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-[#27272a]">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70">Sitemap URL</label>
            <input 
              type="text" 
              value={sitemap} 
              onChange={(e) => setSitemap(e.target.value)} 
              placeholder="e.g. https://rishi.dev/sitemap.xml" 
              className={inputClass} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70">Google Analytics ID</label>
            <input 
              type="text" 
              value={googleAnalyticsId} 
              onChange={(e) => setGoogleAnalyticsId(e.target.value)} 
              placeholder="e.g. G-XXXXXXXXXX" 
              className={inputClass} 
            />
          </div>
        </div>
      </form>

      {/* Save Button Portal */}
      {portalRoot && createPortal(
        <div className={`p-4 border-t flex justify-end transition-colors duration-500 ${
          isDark ? "bg-[#09090b] border-[#27272a]" : "bg-[#fafafa] border-neutral-200"
        }`}>
          <button 
            disabled={isSaving}
            className={`${buttonClass} bg-blue-600 border-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 shadow-lg px-8 py-2.5 !text-sm flex items-center gap-2`}
            onClick={handleSave}
          >
             {isSaving ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : "Save SEO Settings"}
          </button>
        </div>,
        portalRoot
      )}

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal 
          theme={theme} 
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(media) => {
            setOgImage(media.url);
            setIsMediaPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
