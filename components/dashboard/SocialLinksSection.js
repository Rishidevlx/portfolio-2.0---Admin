"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

export default function SocialLinksSection({ theme, inputClass, buttonClass }) {
  const portalRoot = typeof document !== 'undefined' ? document.getElementById('save-button-portal') : null;
  const isDark = theme === "dark";

  const [socials, setSocials] = useState({
    linkedin: "",
    mail: "",
    github: "",
    whatsapp: "",
    mobile: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content/sociallinks")
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setSocials({
            linkedin: json.data.linkedin || "",
            mail: json.data.mail || "",
            github: json.data.github || "",
            whatsapp: json.data.whatsapp || "",
            mobile: json.data.mobile || ""
          });
        }
      })
      .catch(() => toast.error("Failed to load Social Links from database."));
  }, []);

  const handleChange = (e) => {
    setSocials({ ...socials, [e.target.name]: e.target.value });
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/content/sociallinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socials),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Social links synced to Live Portfolio!", { classNames: { icon: "text-green-500" } });
      } else {
        toast.error(data.error || "Failed to save social links");
      }
    } catch (error) {
      toast.error("Network error. Could not save social links.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-bold opacity-80">Social Media Configurations</h3>
          <p className="text-xs opacity-60 mt-1">Manage all your external social links that will reflect across your portfolio.</p>
        </div>
      </div>

      <form className={`p-6 rounded-2xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"} space-y-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              LinkedIn Profile
            </label>
            <input type="url" name="linkedin" value={socials.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" className={inputClass} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
              <svg className="w-4 h-4 text-neutral-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub Repository
            </label>
            <input type="url" name="github" value={socials.github} onChange={handleChange} placeholder="https://github.com/yourusername" className={inputClass} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/></svg>
              Mail ID
            </label>
            <input type="email" name="mail" value={socials.mail} onChange={handleChange} placeholder="yourmail@example.com" className={inputClass} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              WhatsApp Link
            </label>
            <input type="url" name="whatsapp" value={socials.whatsapp} onChange={handleChange} placeholder="https://wa.me/1234567890" className={inputClass} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.498 0c2.482 0 4.502 2.019 4.502 4.5v15c0 2.481-2.02 4.5-4.502 4.5h-10.996c-2.482 0-4.502-2.019-4.502-4.5v-15c0-2.481 2.02-4.5 4.502-4.5h10.996zm-5.498 21.5c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm6.5-4.5v-14h-13v14h13z"/></svg>
              Mobile Number
            </label>
            <input type="text" name="mobile" value={socials.mobile} onChange={handleChange} placeholder="+91 9876543210" className={inputClass} />
          </div>
          
        </div>
      </form>

      {portalRoot && createPortal(
        <div className={`p-4 border-t flex justify-end transition-colors duration-500 ${
          isDark ? "bg-[#09090b] border-[#27272a]" : "bg-[#fafafa] border-neutral-200"
        }`}>
          <button 
            disabled={isSaving}
            className={`${buttonClass} bg-blue-600 border-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 shadow-lg`}
            onClick={handleSaveAll}
          >
            {isSaving ? "Syncing..." : "Save All Changes to Live Portfolio"}
          </button>
        </div>,
        portalRoot
      )}
    </div>
  );
}
