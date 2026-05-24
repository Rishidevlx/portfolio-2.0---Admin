"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import MediaPickerModal from "./MediaPickerModal";

export default function SkillsSection({ theme, inputClass, buttonClass }) {
  const portalRoot = typeof document !== 'undefined' ? document.getElementById('save-button-portal') : null;
  const isDark = theme === "dark";

  const [skills, setSkills] = useState([]);
  const [skillCategories, setSkillCategories] = useState(["Frontend", "Backend", "Database", "Tools", "Testing", "Design", "Other"]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkillIconFile, setNewSkillIconFile] = useState(null);
  
  // State for New Skill Form
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState(skillCategories[0]);
  const [newSkillLink, setNewSkillLink] = useState("");
  const [newSkillIcon, setNewSkillIcon] = useState("");
  
  // State for Drag and Drop
  const [draggedSkillId, setDraggedSkillId] = useState(null);

  // State for Media Picker Modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // State for Adding New Category
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    // Fetch categories and skills on mount
    Promise.all([
      fetch("/api/content/categories").then(res => res.json()),
      fetch("/api/content/skills").then(res => res.json())
    ]).then(([catsData, skillsData]) => {
      if (catsData.success && catsData.data.length > 0) {
        setSkillCategories(catsData.data);
        if (!newSkillCategory) setNewSkillCategory(catsData.data[0]);
      }
      if (skillsData.success) {
        setSkills(skillsData.data);
      }
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleSkillIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSkillIconFile(file);
      const fakeUrl = URL.createObjectURL(file);
      setNewSkillIcon(fakeUrl);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName || (!newSkillIconFile && !newSkillIcon)) {
      toast.error("Please provide both skill name and an icon.");
      return;
    }
    
    setIsSaving(true);
    const toastId = toast.loading("Uploading icon to Cloudinary & saving skill...");

    try {
      const catSkills = skills.filter(s => s.category === newSkillCategory);
      
      const formData = new FormData();
      formData.append("name", newSkillName);
      formData.append("category", newSkillCategory);
      if (newSkillIconFile) {
        formData.append("icon", newSkillIconFile);
      } else if (newSkillIcon) {
        formData.append("iconUrl", newSkillIcon);
      }
      formData.append("linkUrl", newSkillLink || "#");
      formData.append("order", catSkills.length);

      const res = await fetch("/api/content/skills", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setSkills([...skills, data.data]);
        setNewSkillName("");
        setNewSkillLink("");
        setNewSkillIcon("");
        setNewSkillIconFile(null);
        toast.success("Skill added successfully!", { id: toastId, classNames: { icon: "text-green-500" } });
      } else {
        toast.error(data.error || "Failed to add skill", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (skillCategories.includes(newCategoryName.trim())) {
      toast.error("Category already exists!");
      return;
    }
    setSkillCategories([...skillCategories, newCategoryName.trim()]);
    setNewCategoryName("");
    setIsAddingCategory(false);
    toast.success(`Category "${newCategoryName.trim()}" added!`, { classNames: { icon: "text-green-500" } });
    if (!newSkillCategory) {
      setNewSkillCategory(newCategoryName.trim());
    }
  };

  const updateSkill = (id, field, value) => {
    setSkills(skills.map(s => {
      if (s.id === id) {
        if (field === 'category') {
          const catSkills = skills.filter(skill => skill.category === value);
          return { ...s, [field]: value, order: catSkills.length };
        }
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const deleteSkill = async (id) => {
    try {
      const res = await fetch(`/api/content/skills?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSkills(skills.filter(s => s.id !== id));
        toast.success("Skill deleted permanently.", { classNames: { icon: "text-green-500" } });
      } else {
        toast.error(data.error || "Failed to delete.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Syncing layout and visibility to TiDB database...");
    try {
      const res = await fetch("/api/content/skills/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Skills order and visibility synced to Live Portfolio!", { id: toastId, classNames: { icon: "text-green-500" } });
      } else {
        toast.error(data.error || "Failed to sync.", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e, id) => {
    setDraggedSkillId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e) => {
    setDraggedSkillId(null);
  };

  const handleDrop = (e, targetId, targetCategory) => {
    e.preventDefault();
    if (!draggedSkillId || draggedSkillId === targetId) return;

    const draggedSkill = skills.find(s => s.id === draggedSkillId);
    
    if (draggedSkill.category !== targetCategory) {
       toast.error("Please use the dropdown menu to change categories.", { classNames: { icon: "text-amber-500" } });
       return;
    }

    const catSkills = skills.filter(s => s.category === targetCategory).sort((a, b) => a.order - b.order);
    const draggedIdx = catSkills.findIndex(s => s.id === draggedSkillId);
    const targetIdx = catSkills.findIndex(s => s.id === targetId);

    const newCatSkills = [...catSkills];
    const [removed] = newCatSkills.splice(draggedIdx, 1);
    newCatSkills.splice(targetIdx, 0, removed);

    const updatedSkills = skills.map(s => {
      if (s.category === targetCategory) {
        const newOrder = newCatSkills.findIndex(ns => ns.id === s.id);
        return { ...s, order: newOrder };
      }
      return s;
    });

    setSkills(updatedSkills);
  };

  return (
    <div className="space-y-6 relative">
      {/* Absolute positioning for the Add Category form to overlay slightly or just push content down. We'll put it inline below. */}
      
      {/* Workspace Header Actions Injection (simulating the + Add New Category button inside the component) */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-bold opacity-80">Skills Form & Preview</h3>
        </div>
        <button
          onClick={() => setIsAddingCategory(!isAddingCategory)}
          className={buttonClass}
        >
          {isAddingCategory ? "Cancel" : "+ Add New Category"}
        </button>
      </div>

      {/* Add Category Form (Conditionally Rendered) */}
      {isAddingCategory && (
        <form onSubmit={handleAddCategory} className={`p-4 rounded-xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"} flex items-end gap-4 animate-fadeIn`}>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70">New Category Heading</label>
            <input 
              type="text" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              placeholder="e.g. Cloud & DevOps" 
              className={inputClass} 
              autoFocus
              required 
            />
          </div>
          <button type="submit" className={buttonClass}>Save Category</button>
        </form>
      )}

      {/* Add Skill Form */}
      <form onSubmit={handleAddSkill} className={`p-5 rounded-xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"} space-y-4`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70">Skill Name</label>
            <input type="text" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} placeholder="e.g. GraphQL" className={inputClass} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70">Redirect Link</label>
            <input type="url" value={newSkillLink} onChange={(e) => setNewSkillLink(e.target.value)} placeholder="e.g. https://graphql.org" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70">Category</label>
            <select value={newSkillCategory} onChange={(e) => setNewSkillCategory(e.target.value)} className={inputClass}>
              {skillCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70">Icon Upload</label>
            <div className="flex gap-2">
              <label className="w-full block flex-1">
                <input type="file" accept="image/*" onChange={handleSkillIconChange} className="hidden" />
                <div className={`w-full h-full flex items-center justify-center px-3.5 py-2 rounded-lg border border-dashed text-xs font-semibold text-center cursor-pointer transition-colors ${
                  isDark ? "border-[#27272a] hover:border-blue-500 bg-[#09090b]" : "border-neutral-300 hover:border-blue-500 bg-white"
                }`}>
                  {newSkillIconFile ? "File Selected" : "Upload Image"}
                </div>
              </label>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className={`w-full block flex-1 px-3.5 py-2 rounded-lg border border-dashed text-xs font-semibold text-center cursor-pointer transition-colors ${
                  isDark ? "border-[#27272a] hover:border-blue-500 bg-[#09090b]" : "border-neutral-300 hover:border-blue-500 bg-white"
                }`}
              >
                {newSkillIcon && !newSkillIconFile ? "Library Icon Picked" : "Pick from Library"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isSaving} className={`${buttonClass} disabled:opacity-60 disabled:cursor-not-allowed`}>
            {isSaving ? "Processing..." : "Add Skill to Database"}
          </button>
        </div>
      </form>

      {/* Skills List Preview with Drag & Drop */}
      <div className="space-y-8 mt-8">
        {skillCategories.map(cat => {
          const catSkills = skills.filter(s => s.category === cat).sort((a, b) => a.order - b.order);
          if (catSkills.length === 0) return null;
          
          return (
            <div key={cat} className="space-y-3">
              <h4 className={`text-sm font-bold opacity-80 border-b pb-2 ${isDark ? "border-[#27272a]" : "border-neutral-200"}`}>
                {cat} <span className="text-xs font-normal opacity-50 ml-2">({catSkills.length} skills)</span>
              </h4>
              <div className="space-y-2">
                {catSkills.map(skill => (
                  <div 
                    key={skill.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, skill.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, skill.id, cat)}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-200 ${
                      isDark ? "bg-[#09090b] border-[#27272a] hover:border-blue-500/50" : "bg-white border-neutral-200 hover:border-blue-500/50"
                    } ${draggedSkillId === skill.id ? "opacity-50 scale-[0.98]" : "opacity-100"}`}
                  >
                    <div className="cursor-grab active:cursor-grabbing p-1 opacity-40 hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                    
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border ${
                      isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"
                    }`}>
                      {skill.iconUrl ? (
                        <img src={skill.iconUrl} alt={skill.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-[10px] font-bold opacity-40">ICON</span>
                      )}
                    </div>
                    
                    <div className="flex-1 font-bold text-sm tracking-tight">
                      {skill.name}
                      {!skill.isVisible && <span className="ml-2 text-[10px] uppercase font-semibold text-red-500/70 border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 rounded">Hidden</span>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <select 
                         value={skill.category} 
                         onChange={(e) => updateSkill(skill.id, 'category', e.target.value)} 
                         className={`text-xs p-1.5 rounded-lg outline-none border transition-colors ${
                           isDark ? "bg-[#18181b] border-[#27272a] focus:border-blue-500" : "bg-neutral-50 border-neutral-200 focus:border-blue-500"
                         }`}
                      >
                         {skillCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      
                      <button 
                        onClick={() => updateSkill(skill.id, 'isVisible', !skill.isVisible)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          skill.isVisible 
                            ? (isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100") 
                            : (isDark ? "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700" : "bg-neutral-100 text-neutral-500 border-neutral-300 hover:bg-neutral-200")
                        }`}
                        title={skill.isVisible ? "Visible on Portfolio" : "Hidden from Portfolio"}
                      >
                        {skill.isVisible ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => deleteSkill(skill.id)} 
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isDark ? "border-[#27272a] text-red-400 hover:bg-red-500/10 hover:border-red-500/30" : "border-neutral-200 text-red-500 hover:bg-red-50 hover:border-red-200"
                        }`}
                        title="Delete Skill"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
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

      {isMediaPickerOpen && (
        <MediaPickerModal 
          theme={theme} 
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(media) => {
            setNewSkillIcon(media.url);
            setNewSkillIconFile(null); // Clear file since we use library URL
            setIsMediaPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
