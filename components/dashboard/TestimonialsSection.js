"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import MediaPickerModal from "./MediaPickerModal";

export default function TestimonialsSection({ theme, inputClass, buttonClass }) {
  const portalRoot = typeof document !== 'undefined' ? document.getElementById('save-button-portal') : null;
  const isDark = theme === "dark";

  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    fetch("/api/content/testimonials")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTestimonials(data.data);
        }
      })
      .catch(() => toast.error("Failed to load testimonials."))
      .finally(() => setIsLoading(false));
  }, []);
  
  // Drag state
  const [draggedId, setDraggedId] = useState(null);
  const [pickerTarget, setPickerTarget] = useState(null); // 'new', 'test_id'

  // New Testimonial Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newPlatform, setNewPlatform] = useState("Fiverr");
  const [newAvatar, setNewAvatar] = useState(null);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    if (!newName || !newReview) {
      toast.error("Client Name and Review Content are required.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Adding testimonial...");

    const formData = new FormData();
    formData.append("id", `test_${Date.now()}`);
    formData.append("clientName", newName);
    formData.append("company", newCompany);
    formData.append("review", newReview);
    formData.append("rating", newRating);
    formData.append("platform", newPlatform);
    formData.append("order", testimonials.length);
    if (newAvatar) {
      formData.append("avatar", newAvatar);
    } else if (newAvatarUrl) {
      formData.append("avatarUrl", newAvatarUrl);
    }

    try {
      const res = await fetch("/api/content/testimonials", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setTestimonials([...testimonials, data.data]);
        setIsAdding(false);
        setNewName("");
        setNewCompany("");
        setNewReview("");
        setNewRating(5);
        setNewPlatform("Fiverr");
        setNewAvatar(null);
        setNewAvatarUrl("");
        toast.success("Testimonial added to DB!", { id: toastId, classNames: { icon: "text-green-500" } });
      } else {
        toast.error(data.error || "Failed to add testimonial.", { id: toastId });
      }
    } catch (err) {
      toast.error("Network error.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIdx = testimonials.findIndex(t => t.id === draggedId);
    const targetIdx = testimonials.findIndex(t => t.id === targetId);

    const newList = [...testimonials];
    const [removed] = newList.splice(draggedIdx, 1);
    newList.splice(targetIdx, 0, removed);

    const updated = newList.map((t, idx) => ({ ...t, order: idx }));
    setTestimonials(updated);
  };

  const updateTestimonial = (id, field, value) => {
    setTestimonials(testimonials.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDelete = async (id) => {
    if(confirm("Are you sure you want to delete this testimonial?")) {
      const toastId = toast.loading("Deleting...");
      try {
        const res = await fetch(`/api/content/testimonials?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          setTestimonials(testimonials.filter(t => t.id !== id));
          toast.success("Deleted successfully.", { id: toastId, classNames: { icon: "text-green-500" } });
        } else {
          toast.error("Failed to delete.", { id: toastId });
        }
      } catch {
        toast.error("Network error.", { id: toastId });
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Syncing testimonials to TiDB database...");
    
    try {
      const res = await fetch("/api/content/testimonials/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonials })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Testimonials synced to Live Portfolio!", { id: toastId, classNames: { icon: "text-green-500" } });
      } else {
        toast.error(data.error || "Failed to sync.", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-sm opacity-60">Loading testimonials from TiDB database...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-bold opacity-80">Testimonials Form & Preview</h3>
        </div>
      </div>

      {/* Add New Form */}
      <div className={`mb-8 p-5 rounded-xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
            {isAdding ? "Cancel Adding" : "Add New Testimonial"}
          </h3>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={buttonClass}
          >
            {isAdding ? "Cancel" : "+ Add Testimonial"}
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddTestimonial} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Client Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sagar N."
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Company / Role</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. QA Specialist"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Platform Badge</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className={inputClass}
                >
                  <option value="Fiverr">Fiverr</option>
                  <option value="Upwork">Upwork</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Direct">Direct Client</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Rating (Stars)</label>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(e.target.value)}
                  className={inputClass}
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Review Content</label>
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Enter client's review here..."
                className={`${inputClass} min-h-[100px]`}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Client Avatar (Optional)</label>
              <div className="flex gap-2 mt-1">
                <div className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center transition-colors relative cursor-pointer flex flex-col justify-center items-center ${
                  isDark ? "border-[#27272a] hover:border-blue-500 bg-[#09090b]" : "border-neutral-300 hover:border-blue-500 bg-white"
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => { setNewAvatar(e.target.files[0]); setNewAvatarUrl(""); }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {newAvatar ? (
                    <img src={URL.createObjectURL(newAvatar)} alt="Preview" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Upload File
                    </p>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => setPickerTarget("new")}
                  className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer flex flex-col justify-center items-center ${
                    isDark ? "border-[#27272a] hover:border-blue-500 bg-[#09090b]" : "border-neutral-300 hover:border-blue-500 bg-white"
                  }`}
                >
                  {newAvatarUrl ? (
                    <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>URL Selected</span>
                  ) : (
                    <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Pick from Library</span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className={buttonClass}>
                Add to List
              </button>
            </div>
          </form>
        )}
      </div>

      {/* List of Testimonials */}
      <div className="space-y-4">
        {testimonials.length === 0 ? (
          <div className={`p-8 text-center border-2 border-dashed rounded-xl ${isDark ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-500"}`}>
            No testimonials added yet. Click above to add one.
          </div>
        ) : (
          testimonials.map((t, idx) => (
            <div
              key={t.id}
              draggable
              onDragStart={(e) => handleDragStart(e, t.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, t.id)}
              className={`group flex gap-4 p-4 rounded-xl border transition-all ${
                draggedId === t.id ? "opacity-50 scale-[0.98]" : "opacity-100"
              } ${
                isDark 
                ? "bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]" 
                : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
              }`}
            >
              <div className="flex items-center cursor-grab active:cursor-grabbing px-2">
                <svg className={`w-5 h-5 ${isDark ? "text-gray-600 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"></path>
                </svg>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Avatar */}
                <div className="shrink-0 relative group">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt={t.clientName} className="w-12 h-12 rounded-full object-cover border border-gray-600" />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity flex flex-col items-center justify-center gap-1">
                    <label className="cursor-pointer bg-white/20 hover:bg-white/40 backdrop-blur-sm px-1 py-[2px] rounded-sm transition-colors text-[7px] font-bold text-white uppercase tracking-wider">
                      <span>Up</span>
                      <input type="file" accept="image/*" onChange={(e) => {
                        if(e.target.files[0]) {
                          const url = URL.createObjectURL(e.target.files[0]);
                          updateTestimonial(t.id, 'avatarUrl', url);
                        }
                      }} className="hidden" />
                    </label>
                    <button 
                      onClick={() => setPickerTarget(t.id)}
                      className="bg-white/20 hover:bg-white/40 backdrop-blur-sm px-1 py-[2px] rounded-sm transition-colors text-[7px] font-bold text-white uppercase tracking-wider"
                    >
                      Lib
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 w-full">
                    <input 
                      type="text"
                      value={t.clientName}
                      onChange={(e) => updateTestimonial(t.id, 'clientName', e.target.value)}
                      className={`font-semibold text-lg bg-transparent border-none outline-none ring-0 p-0 focus:ring-0 ${isDark ? "text-white" : "text-gray-900"} w-[120px]`}
                    />
                    
                    <select
                      value={t.platform}
                      onChange={(e) => updateTestimonial(t.id, 'platform', e.target.value)}
                      className={`text-xs px-2 py-0.5 rounded-full border outline-none ${isDark ? "bg-[#18181b] border-gray-600 text-gray-300" : "bg-white border-gray-200 text-gray-600"}`}
                    >
                      <option className={isDark ? "bg-[#18181b]" : ""} value="Fiverr">Fiverr</option>
                      <option className={isDark ? "bg-[#18181b]" : ""} value="Upwork">Upwork</option>
                      <option className={isDark ? "bg-[#18181b]" : ""} value="LinkedIn">LinkedIn</option>
                      <option className={isDark ? "bg-[#18181b]" : ""} value="Freelancer">Freelancer</option>
                      <option className={isDark ? "bg-[#18181b]" : ""} value="Direct">Direct</option>
                    </select>

                    <div className="flex items-center ml-2 text-yellow-500">
                      <select 
                        value={t.rating} 
                        onChange={(e) => updateTestimonial(t.id, 'rating', Number(e.target.value))}
                        className={`text-xs ml-1 border-none outline-none ring-0 rounded ${isDark ? "bg-[#18181b] text-gray-400" : "bg-white text-gray-500"}`}
                      >
                        {[5,4,3,2,1].map(num => <option key={num} className={isDark ? "bg-[#18181b]" : ""} value={num}>{num} ★</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-1 text-sm mb-2 w-full ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <input 
                      type="text"
                      value={t.company}
                      onChange={(e) => updateTestimonial(t.id, 'company', e.target.value)}
                      className="bg-transparent border-none outline-none ring-0 p-0 focus:ring-0 w-full"
                      placeholder="Company/Role"
                    />
                  </div>

                  <textarea
                    value={t.review}
                    onChange={(e) => updateTestimonial(t.id, 'review', e.target.value)}
                    className={`text-sm italic w-full bg-transparent border border-dashed rounded p-2 focus:border-blue-500 outline-none resize-none ${isDark ? "text-gray-300 border-[#3f3f46]" : "text-gray-600 border-gray-300"}`}
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex items-start">
                <button
                  onClick={() => handleDelete(t.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-50 text-red-500"
                  }`}
                  title="Delete Testimonial"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {portalRoot && createPortal(
        <div className={`p-4 border-t flex justify-end transition-colors duration-500 ${
          isDark ? "bg-[#09090b] border-[#27272a]" : "bg-[#fafafa] border-neutral-200"
        }`}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`${buttonClass} px-8 py-2.5 !text-sm flex items-center gap-2 shadow-lg`}
          >
            {isSaving ? "Saving..." : "Save All Changes to Live Portfolio"}
          </button>
        </div>,
        portalRoot
      )}

      {pickerTarget && (
        <MediaPickerModal 
          theme={theme}
          onClose={() => setPickerTarget(null)}
          onSelect={(media) => {
            if (pickerTarget === "new") {
              setNewAvatarUrl(media.url);
              setNewAvatar(null);
            } else {
              updateTestimonial(pickerTarget, 'avatarUrl', media.url);
            }
            setPickerTarget(null);
          }}
        />
      )}
    </div>
  );
}
