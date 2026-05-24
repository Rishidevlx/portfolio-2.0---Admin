"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import MediaPickerModal from "./MediaPickerModal";

export default function ExperienceSection({ theme, inputClass, buttonClass }) {
  const portalRoot = typeof document !== 'undefined' ? document.getElementById('save-button-portal') : null;
  const isDark = theme === "dark";

  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedExpId, setDraggedExpId] = useState(null);
  const [pickerTarget, setPickerTarget] = useState(null); // 'new', 'exp_id', 'skill_expId'

  // New Experience Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newLogoFile, setNewLogoFile] = useState(null);
  const [newLogoUrl, setNewLogoUrl] = useState("");
  
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleType, setNewRoleType] = useState("Full-time");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newDuration, setNewDuration] = useState("");

  useEffect(() => {
    fetch("/api/content/experiences")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setExperiences(data.data);
        }
      })
      .catch(() => toast.error("Failed to load experiences."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewLogoFile(file);
      setNewLogoUrl("");
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!newCompany || (!newLogoFile && !newLogoUrl) || !newRoleTitle) {
      toast.error("Company name, logo, and initial role are required.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Uploading logo and creating experience...");

    const expId = `exp_${Date.now()}`;
    const roles = [
      {
        id: `r_${Date.now()}`,
        title: newRoleTitle,
        type: newRoleType,
        startDate: newStartDate,
        endDate: newEndDate,
        duration: newDuration
      }
    ];

    const formData = new FormData();
    formData.append("id", expId);
    formData.append("companyName", newCompany);
    formData.append("companyLink", newLink);
    if (newLogoFile) {
      formData.append("logo", newLogoFile);
    } else if (newLogoUrl) {
      formData.append("logoUrl", newLogoUrl);
    }
    formData.append("roles", JSON.stringify(roles));
    formData.append("order", experiences.length);

    try {
      const res = await fetch("/api/content/experiences", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setExperiences([...experiences, data.data]);
        setIsAdding(false);
        setNewCompany("");
        setNewLink("");
        setNewLogoFile(null);
        setNewLogoUrl("");
        setNewRoleTitle("");
        setNewRoleType("Full-time");
        setNewStartDate("");
        setNewEndDate("");
        setNewDuration("");
        toast.success("Experience added successfully!", { id: toastId, classNames: { icon: "text-green-500" } });
      } else {
        toast.error(data.error || "Failed to add experience.", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e, id) => {
    setDraggedExpId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedExpId(null);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedExpId || draggedExpId === targetId) return;

    const draggedIdx = experiences.findIndex(ex => ex.id === draggedExpId);
    const targetIdx = experiences.findIndex(ex => ex.id === targetId);

    const newExperiences = [...experiences];
    const [removed] = newExperiences.splice(draggedIdx, 1);
    newExperiences.splice(targetIdx, 0, removed);

    const updated = newExperiences.map((ex, idx) => ({ ...ex, order: idx }));
    setExperiences(updated);
  };

  const addRole = (expId) => {
    setExperiences(experiences.map(ex => {
      if (ex.id === expId) {
        return {
          ...ex,
          roles: [...ex.roles, { id: `r_${Date.now()}`, title: "", type: "Full-time", startDate: "", endDate: "", duration: "" }]
        };
      }
      return ex;
    }));
  };

  const updateRole = (expId, roleId, field, value) => {
    setExperiences(experiences.map(ex => {
      if (ex.id === expId) {
        return {
          ...ex,
          roles: ex.roles.map(r => r.id === roleId ? { ...r, [field]: value } : r)
        };
      }
      return ex;
    }));
  };

  const deleteRole = (expId, roleId) => {
    setExperiences(experiences.map(ex => {
      if (ex.id === expId) {
        return { ...ex, roles: ex.roles.filter(r => r.id !== roleId) };
      }
      return ex;
    }));
  };

  const addSkillIcon = async (expId, file) => {
    if (!file) return;
    
    const toastId = toast.loading("Uploading skill icon...");
    const formData = new FormData();
    formData.append("icon", file);

    try {
      const res = await fetch("/api/content/experiences/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setExperiences(experiences.map(ex => {
          if (ex.id === expId) {
            return {
              ...ex,
              skills: [...ex.skills, { id: `s_${Date.now()}`, icon: data.secure_url }]
            };
          }
          return ex;
        }));
        toast.success("Icon uploaded!", { id: toastId, classNames: { icon: "text-green-500" } });
      } else {
        toast.error("Failed to upload icon.", { id: toastId });
      }
    } catch {
      toast.error("Network error.", { id: toastId });
    }
  };

  const deleteSkillIcon = (expId, skillId) => {
    setExperiences(experiences.map(ex => {
      if (ex.id === expId) {
        return { ...ex, skills: ex.skills.filter(s => s.id !== skillId) };
      }
      return ex;
    }));
  };

  const deleteExperience = async (expId) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    
    const toastId = toast.loading("Deleting experience...");
    try {
      const res = await fetch(`/api/content/experiences?id=${expId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setExperiences(experiences.filter(ex => ex.id !== expId));
        toast.success("Experience deleted.", { id: toastId, classNames: { icon: "text-green-500" } });
      } else {
        toast.error(data.error || "Failed to delete.", { id: toastId });
      }
    } catch {
      toast.error("Network error.", { id: toastId });
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Syncing experiences to TiDB database...");
    
    try {
      const res = await fetch("/api/content/experiences/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experiences })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Experience data synced to Live Portfolio!", { id: toastId, classNames: { icon: "text-green-500" } });
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
    return <div className="p-8 text-center text-sm opacity-60">Loading experiences from TiDB database...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-bold opacity-80">Experience Form & Preview</h3>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className={buttonClass}>
          {isAdding ? "Cancel" : "+ Add New Experience"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddExperience} className={`p-5 rounded-xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"} space-y-4 animate-fadeIn`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Company Name</label>
              <input type="text" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="e.g. GoPlus" className={inputClass} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Company Web Link</label>
              <input type="url" value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="e.g. https://goplus.com" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Company Logo</label>
              <div className="flex gap-2">
                <label className="w-full block flex-1">
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  <div className={`w-full h-full flex items-center justify-center px-3.5 py-2 rounded-lg border border-dashed text-xs font-semibold text-center cursor-pointer transition-colors ${
                    isDark ? "border-[#27272a] hover:border-blue-500 bg-[#09090b]" : "border-neutral-300 hover:border-blue-500 bg-white"
                  }`}>
                    {newLogoFile ? "File Selected" : "Upload File"}
                  </div>
                </label>
                <button
                  type="button"
                  onClick={() => setPickerTarget("new")}
                  className={`w-full block flex-1 px-3.5 py-2 rounded-lg border border-dashed text-xs font-semibold text-center cursor-pointer transition-colors ${
                    isDark ? "border-[#27272a] hover:border-blue-500 bg-[#09090b]" : "border-neutral-300 hover:border-blue-500 bg-white"
                  }`}
                >
                  {newLogoUrl ? "Library URL Picked" : "Pick from Library"}
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 dark:border-[#27272a] pt-4 mt-2">
            <h4 className="text-xs font-bold uppercase opacity-70 mb-3">Initial Role Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Role Title</label>
                <input type="text" value={newRoleTitle} onChange={(e) => setNewRoleTitle(e.target.value)} placeholder="e.g. Frontend Developer" className={inputClass} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Employment Type</label>
                <select value={newRoleType} onChange={(e) => setNewRoleType(e.target.value)} className={inputClass}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Start Date</label>
                <input type="text" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} placeholder="e.g. Feb 2024" className={inputClass} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">End Date</label>
                <input type="text" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} placeholder="e.g. Nov 2024" className={inputClass} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Duration</label>
                <input type="text" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} placeholder="e.g. 1 yr 4 mos" className={inputClass} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSaving} className={`${buttonClass} disabled:opacity-60`}>
              {isSaving ? "Saving..." : "Add Experience"}
            </button>
          </div>
        </form>
      )}

      {/* Experience List Preview with Drag & Drop */}
      <div className="space-y-4 mt-8">
        {experiences.length === 0 && (
          <div className="p-8 text-center text-sm opacity-60 border border-dashed rounded-xl dark:border-[#27272a] border-neutral-300">
            No experiences found. Create one to get started.
          </div>
        )}
        
        {experiences.map((exp) => (
          <div 
            key={exp.id}
            draggable
            onDragStart={(e) => handleDragStart(e, exp.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, exp.id)}
            className={`p-5 rounded-xl border transition-all duration-200 ${
              isDark ? "bg-[#09090b] border-[#27272a] hover:border-blue-500/30" : "bg-white border-neutral-200 hover:border-blue-500/30"
            } ${draggedExpId === exp.id ? "opacity-50 scale-[0.98]" : "opacity-100"}`}
          >
            {/* Header: Drag handle, Company Info, Delete */}
            <div className="flex items-center gap-4 border-b border-neutral-200 dark:border-[#27272a] pb-4 mb-5">
              <div className="cursor-grab active:cursor-grabbing p-1 opacity-40 hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border relative group ${
                isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"
              }`}>
                {exp.companyLogo ? (
                  <img src={exp.companyLogo} alt={exp.companyName} className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-[10px] font-bold opacity-40">LOGO</span>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <label className="cursor-pointer bg-white/20 hover:bg-white/40 backdrop-blur-sm px-1 py-[2px] rounded-sm transition-colors text-[8px] font-bold text-white uppercase tracking-wider">
                    <span>Up</span>
                    <input type="file" accept="image/*" onChange={(e) => {
                      if(e.target.files[0]) {
                        const url = URL.createObjectURL(e.target.files[0]);
                        setExperiences(experiences.map(ex => ex.id === exp.id ? { ...ex, companyLogo: url } : ex));
                      }
                    }} className="hidden" />
                  </label>
                  <button 
                    onClick={() => setPickerTarget(exp.id)}
                    className="bg-white/20 hover:bg-white/40 backdrop-blur-sm px-1 py-[2px] rounded-sm transition-colors text-[8px] font-bold text-white uppercase tracking-wider"
                  >
                    Lib
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-lg tracking-tight flex items-center gap-2">
                  {exp.companyName}
                  {exp.companyLink && (
                    <a href={exp.companyLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:opacity-70" title="Visit Company Link">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </h4>
              </div>
              
              <button 
                onClick={() => deleteExperience(exp.id)} 
                className={`p-2 rounded-lg border transition-colors ${
                  isDark ? "border-[#27272a] text-red-400 hover:bg-red-500/10 hover:border-red-500/30" : "border-neutral-200 text-red-500 hover:bg-red-50 hover:border-red-200"
                }`}
                title="Delete Experience"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Roles Array Container */}
            <div className="space-y-4 mb-6 relative">
              <div className="absolute left-3.5 top-3 bottom-3 w-[1px] bg-neutral-300 dark:bg-neutral-700"></div>
              
              {exp.roles.map((role, idx) => (
                <div key={role.id} className="relative pl-10 pt-2 pb-2">
                  <div className="absolute left-[10px] top-4 w-2 h-2 rounded-full bg-[#0f172a] dark:bg-white shadow-[0_0_0_3px_rgba(200,200,200,0.5)] dark:shadow-[0_0_0_3px_rgba(80,80,80,0.5)]"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-3">
                      <input 
                        type="text" 
                        value={role.title} 
                        onChange={(e) => updateRole(exp.id, role.id, 'title', e.target.value)} 
                        className={inputClass} 
                        placeholder="Role Title (e.g. SDE - intern)"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <select 
                        value={role.type} 
                        onChange={(e) => updateRole(exp.id, role.id, 'type', e.target.value)} 
                        className={inputClass}
                      >
                        <option className={isDark ? "bg-[#18181b]" : ""} value="Full-time">Full-time</option>
                        <option className={isDark ? "bg-[#18181b]" : ""} value="Part-time">Part-time</option>
                        <option className={isDark ? "bg-[#18181b]" : ""} value="Internship">Internship</option>
                        <option className={isDark ? "bg-[#18181b]" : ""} value="Contract">Contract</option>
                        <option className={isDark ? "bg-[#18181b]" : ""} value="Freelance">Freelance</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        value={role.startDate} 
                        onChange={(e) => updateRole(exp.id, role.id, 'startDate', e.target.value)} 
                        className={inputClass} 
                        placeholder="Start (Mar 2023)"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        value={role.endDate} 
                        onChange={(e) => updateRole(exp.id, role.id, 'endDate', e.target.value)} 
                        className={inputClass} 
                        placeholder="End (Feb 2024)"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        value={role.duration || ''} 
                        onChange={(e) => updateRole(exp.id, role.id, 'duration', e.target.value)} 
                        className={inputClass} 
                        placeholder="Duration (1 yr 4 mos)"
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <button 
                        onClick={() => deleteRole(exp.id, role.id)}
                        className={`text-xs p-1.5 rounded-lg border transition-colors ${isDark ? "border-[#27272a] text-red-400 hover:bg-red-500/10" : "border-neutral-200 text-red-500 hover:bg-red-50"}`}
                        title="Remove Role"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pl-10 mt-2">
                <button onClick={() => addRole(exp.id)} className="text-xs font-semibold text-blue-500 hover:underline">
                  + Add Another Role
                </button>
              </div>
            </div>

            {/* Acquired Skills Array */}
            <div className="pl-10 flex flex-wrap items-center gap-3 mt-4">
              <span className="text-sm font-semibold opacity-80 mr-2 tracking-tight">Acquired tech skills</span>
              {exp.skills.map(skill => (
                <div key={skill.id} className="relative group">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center overflow-hidden bg-white dark:bg-[#09090b] ${isDark ? "border-[#27272a]" : "border-neutral-200"}`}>
                    {skill.icon ? <img src={skill.icon} alt="skill" className="w-5 h-5 object-contain" /> : <span className="text-[8px] font-bold">ICON</span>}
                  </div>
                  <button 
                    onClick={() => deleteSkillIcon(exp.id, skill.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              
              <div className="flex flex-col gap-1">
                <label className="cursor-pointer" title="Add Skill Icon">
                  <input type="file" accept="image/*" onChange={(e) => addSkillIcon(exp.id, e.target.files[0])} className="hidden" />
                  <div className={`w-8 h-8 rounded-full border border-dashed flex items-center justify-center transition-colors ${isDark ? "border-[#27272a] hover:border-blue-500 hover:text-blue-500 text-neutral-400 bg-[#18181b]" : "border-neutral-300 hover:border-blue-500 hover:text-blue-500 text-neutral-400 bg-neutral-50"}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                </label>
                <button 
                  title="Pick Skill Icon from Library"
                  onClick={() => setPickerTarget(`skill_${exp.id}`)}
                  className={`w-8 h-8 rounded-full border border-dashed flex items-center justify-center transition-colors ${isDark ? "border-[#27272a] hover:border-blue-500 hover:text-blue-500 text-neutral-400 bg-[#18181b]" : "border-neutral-300 hover:border-blue-500 hover:text-blue-500 text-neutral-400 bg-neutral-50"}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        ))}
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

      {pickerTarget && (
        <MediaPickerModal 
          theme={theme}
          onClose={() => setPickerTarget(null)}
          onSelect={(media) => {
            if (pickerTarget === "new") {
              setNewLogoUrl(media.url);
              setNewLogoFile(null);
            } else if (pickerTarget.startsWith("skill_")) {
              const expId = pickerTarget.replace("skill_", "");
              setExperiences(experiences.map(ex => {
                if (ex.id === expId) {
                  return { ...ex, skills: [...ex.skills, { id: `s_${Date.now()}`, icon: media.url }] };
                }
                return ex;
              }));
            } else {
              // Existing experience logo
              setExperiences(experiences.map(ex => ex.id === pickerTarget ? { ...ex, companyLogo: media.url } : ex));
            }
            setPickerTarget(null);
          }}
        />
      )}
    </div>
  );
}
