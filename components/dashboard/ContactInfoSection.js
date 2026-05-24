"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

export default function ContactInfoSection({ theme, inputClass, buttonClass }) {
  const portalRoot = typeof document !== 'undefined' ? document.getElementById('save-button-portal') : null;
  const isDark = theme === "dark";

  const [contact, setContact] = useState({
    email: "",
    phone: "",
    location: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content/contactinfo")
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setContact({
            email: json.data.email || "",
            phone: json.data.phone || "",
            location: json.data.location || ""
          });
        }
      })
      .catch(() => toast.error("Failed to load Contact Info from database."));
  }, []);

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/content/contactinfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Contact info synced to Live Portfolio!", { classNames: { icon: "text-green-500" } });
      } else {
        toast.error(data.error || "Failed to save contact info");
      }
    } catch (error) {
      toast.error("Network error. Could not save contact info.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-bold opacity-80">Contact Details</h3>
          <p className="text-xs opacity-60 mt-1">Update your primary contact info that appears in the footer and contact sections.</p>
        </div>
      </div>

      <form className={`p-6 rounded-2xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"} space-y-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75m19.5 0v.243m0 0a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993v-.243" />
              </svg>
              Email Address
            </label>
            <input type="email" name="email" value={contact.email} onChange={handleChange} placeholder="contact@yourdomain.com" className={inputClass} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0l6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z" />
              </svg>
              Phone Number
            </label>
            <input type="text" name="phone" value={contact.phone} onChange={handleChange} placeholder="+91 9876543210" className={inputClass} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Location Address
            </label>
            <textarea 
              name="location" 
              value={contact.location} 
              onChange={handleChange} 
              placeholder="e.g. 123, Street Name, City, State, Country" 
              className={inputClass}
              rows={3}
            />
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
