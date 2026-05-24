"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import MediaPickerModal from "./MediaPickerModal";

export default function ProjectsSection({ theme, inputClass, buttonClass }) {
  const portalRoot = typeof document !== 'undefined' ? document.getElementById('save-button-portal') : null;
  const isDark = theme === "dark";

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // 'new', 'proj_id', or 'ts_proj_id'

  useEffect(() => {
    fetch("/api/content/projects")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProjects(data.data);
        }
      })
      .catch(() => toast.error("Failed to load projects."))
      .finally(() => setIsLoading(false));
  }, []);

  const [draggedProjId, setDraggedProjId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // New Project Form State
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLiveUrl, setNewLiveUrl] = useState("");
  const [newGithubUrl, setNewGithubUrl] = useState("");
  const [newThumbnailFile, setNewThumbnailFile] = useState(null);
  const [newThumbnailUrl, setNewThumbnailUrl] = useState("");

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newName || !newDesc || (!newThumbnailFile && !newThumbnailUrl)) {
      toast.error("Project Name, Description, and Thumbnail are required.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Uploading thumbnail and creating project...");

    const projId = `proj_${Date.now()}`;
    const formData = new FormData();
    formData.append("id", projId);
    formData.append("name", newName);
    formData.append("description", newDesc);
    formData.append("liveUrl", newLiveUrl);
    formData.append("githubUrl", newGithubUrl);
    if (newThumbnailFile) {
      formData.append("thumbnail", newThumbnailFile);
    } else if (newThumbnailUrl) {
      formData.append("thumbnailUrl", newThumbnailUrl);
    }
    formData.append("order", projects.length);

    try {
      const res = await fetch("/api/content/projects", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setProjects([...projects, data.data]);
        setIsAdding(false);
        setNewName("");
        setNewDesc("");
        setNewLiveUrl("");
        setNewGithubUrl("");
        setNewThumbnailFile(null);
        setNewThumbnailUrl("");
        toast.success("Project added successfully!", { id: toastId, classNames: { icon: "text-green-500" } });
      } else {
        toast.error(data.error || "Failed to add project.", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e, id) => {
    setDraggedProjId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedProjId(null);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedProjId || draggedProjId === targetId) return;

    const draggedIdx = projects.findIndex(p => p.id === draggedProjId);
    const targetIdx = projects.findIndex(p => p.id === targetId);

    const newProjects = [...projects];
    const [removed] = newProjects.splice(draggedIdx, 1);
    newProjects.splice(targetIdx, 0, removed);

    const updated = newProjects.map((p, idx) => ({ ...p, order: idx }));
    setProjects(updated);
  };

  const updateProject = (id, field, value) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const deleteProject = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const toastId = toast.loading("Deleting project...");
    try {
      const res = await fetch(`/api/content/projects?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProjects(projects.filter(p => p.id !== id));
        toast.success("Project deleted.", { id: toastId, classNames: { icon: "text-green-500" } });
      } else {
        toast.error(data.error || "Failed to delete.", { id: toastId });
      }
    } catch {
      toast.error("Network error.", { id: toastId });
    }
  };

  // Tech Stack Management
  const addTechIcon = async (projId, file) => {
    if (!file) return;
    
    const toastId = toast.loading("Uploading tech icon...");
    const formData = new FormData();
    formData.append("icon", file);

    try {
      const res = await fetch("/api/content/projects/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setProjects(projects.map(p => {
          if (p.id === projId) {
            return {
              ...p,
              techStack: [...p.techStack, { id: `ts_${Date.now()}`, icon: data.secure_url }]
            };
          }
          return p;
        }));
        toast.success("Icon uploaded!", { id: toastId, classNames: { icon: "text-green-500" } });
      } else {
        toast.error("Failed to upload icon.", { id: toastId });
      }
    } catch {
      toast.error("Network error.", { id: toastId });
    }
  };

  const deleteTechIcon = (projId, iconId) => {
    setProjects(projects.map(p => {
      if (p.id === projId) {
        return { ...p, techStack: p.techStack.filter(ts => ts.id !== iconId) };
      }
      return p;
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Syncing projects to TiDB database...");
    
    try {
      const res = await fetch("/api/content/projects/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Projects data synced to Live Portfolio!", { id: toastId, classNames: { icon: "text-green-500" } });
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
    return <div className="p-8 text-center text-sm opacity-60">Loading projects from TiDB database...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-bold opacity-80">Projects Form & Preview</h3>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className={buttonClass}>
          {isAdding ? "Cancel" : "+ Add New Project"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddProject} className={`p-5 rounded-xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"} space-y-4 animate-fadeIn`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Project Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. FyleHQ - Clone" className={inputClass} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Thumbnail Image</label>
              <div className="flex gap-2">
                <label className="w-full block flex-1">
                  <input type="file" accept="image/*" onChange={(e) => { setNewThumbnailFile(e.target.files[0]); setNewThumbnailUrl(""); }} className="hidden" />
                  <div className={`w-full h-full flex items-center justify-center px-3.5 py-2 rounded-lg border border-dashed text-xs font-semibold text-center cursor-pointer transition-colors ${
                    isDark ? "border-[#27272a] hover:border-blue-500 bg-[#09090b]" : "border-neutral-300 hover:border-blue-500 bg-white"
                  }`}>
                    {newThumbnailFile ? "File Selected" : "Upload File"}
                  </div>
                </label>
                <button
                  type="button"
                  onClick={() => setPickerTarget("new")}
                  className={`w-full block flex-1 px-3.5 py-2 rounded-lg border border-dashed text-xs font-semibold text-center cursor-pointer transition-colors ${
                    isDark ? "border-[#27272a] hover:border-blue-500 bg-[#09090b]" : "border-neutral-300 hover:border-blue-500 bg-white"
                  }`}
                >
                  {newThumbnailUrl ? "Library URL Picked" : "Pick from Library"}
                </button>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Full Description</label>
              <textarea 
                value={newDesc} 
                onChange={(e) => setNewDesc(e.target.value)} 
                placeholder="Detailed description of the project..." 
                className={inputClass} 
                rows={6} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Live URL</label>
              <input type="url" value={newLiveUrl} onChange={(e) => setNewLiveUrl(e.target.value)} placeholder="e.g. https://live-demo.com" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">GitHub URL</label>
              <input type="url" value={newGithubUrl} onChange={(e) => setNewGithubUrl(e.target.value)} placeholder="e.g. https://github.com/rishi/project" className={inputClass} />
            </div>
          </div>

          <div className="flex justify-end pt-2 mt-2">
            <button type="submit" disabled={isSaving} className={`${buttonClass} disabled:opacity-60`}>
              {isSaving ? "Saving..." : "Add Project"}
            </button>
          </div>
        </form>
      )}

      {/* Projects List Preview with Drag & Drop */}
      <div className="space-y-4 mt-8">
        {projects.length === 0 && (
          <div className="p-8 text-center text-sm opacity-60 border border-dashed rounded-xl dark:border-[#27272a] border-neutral-300">
            No projects found. Create one to get started.
          </div>
        )}
        
        {projects.map((proj) => (
          <div 
            key={proj.id}
            draggable
            onDragStart={(e) => handleDragStart(e, proj.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, proj.id)}
            className={`p-5 rounded-xl border transition-all duration-200 ${
              isDark ? "bg-[#09090b] border-[#27272a] hover:border-blue-500/30" : "bg-white border-neutral-200 hover:border-blue-500/30"
            } ${draggedProjId === proj.id ? "opacity-50 scale-[0.98]" : "opacity-100"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#27272a] pb-4 mb-4">
              <div className="flex items-center gap-3 w-full">
                <div className="cursor-grab active:cursor-grabbing p-1 opacity-40 hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                <h4 className="font-bold text-lg tracking-tight flex-1">{proj.name}</h4>
              </div>
              <button 
                onClick={() => deleteProject(proj.id)} 
                className={`p-2 rounded-lg border transition-colors ${
                  isDark ? "border-[#27272a] text-red-400 hover:bg-red-500/10 hover:border-red-500/30" : "border-neutral-200 text-red-500 hover:bg-red-50 hover:border-red-200"
                }`}
                title="Delete Project"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Thumbnail Preview */}
              <div className="md:col-span-3 flex flex-col gap-2">
                <div className={`w-full aspect-[4/3] rounded-lg overflow-hidden border flex flex-col items-center justify-center relative group ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-100 border-neutral-200"}`}>
                  {proj.thumbnail ? (
                    <img src={proj.thumbnail} alt={proj.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold opacity-40">NO THUMBNAIL</span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <label className="cursor-pointer bg-white/20 hover:bg-white/40 backdrop-blur-sm px-3 py-1 rounded-md transition-colors w-28 text-center text-[10px] font-bold text-white uppercase tracking-wider">
                      <span>Upload New</span>
                      <input type="file" accept="image/*" onChange={(e) => {
                        if(e.target.files[0]) updateProject(proj.id, 'thumbnail', URL.createObjectURL(e.target.files[0]));
                      }} className="hidden" />
                    </label>
                    <button 
                      onClick={() => setPickerTarget(proj.id)}
                      className="bg-white/20 hover:bg-white/40 backdrop-blur-sm px-3 py-1 rounded-md transition-colors w-28 text-[10px] font-bold text-white uppercase tracking-wider"
                    >
                      From Library
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Edit Inputs */}
              <div className="md:col-span-9 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase opacity-60">Project Name</label>
                    <input 
                      type="text" 
                      value={proj.name} 
                      onChange={(e) => updateProject(proj.id, 'name', e.target.value)} 
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase opacity-60">Description</label>
                    <textarea 
                      value={proj.description} 
                      onChange={(e) => updateProject(proj.id, 'description', e.target.value)} 
                      className={inputClass}
                      rows={6}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase opacity-60">Live URL</label>
                    <input 
                      type="url" 
                      value={proj.liveUrl} 
                      onChange={(e) => updateProject(proj.id, 'liveUrl', e.target.value)} 
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase opacity-60">GitHub URL</label>
                    <input 
                      type="url" 
                      value={proj.githubUrl} 
                      onChange={(e) => updateProject(proj.id, 'githubUrl', e.target.value)} 
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Techstack Icons */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase opacity-60 block mb-2">Techstack Icons</span>
                  <div className="flex flex-wrap items-center gap-3">
                    {proj.techStack.map(ts => (
                      <div key={ts.id} className="relative group">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center overflow-hidden bg-white dark:bg-[#09090b] ${isDark ? "border-[#27272a]" : "border-neutral-200"}`}>
                          {ts.icon ? <img src={ts.icon} alt="tech icon" className="w-5 h-5 object-contain" /> : <span className="text-[8px] font-bold">ICON</span>}
                        </div>
                        <button 
                          onClick={() => deleteTechIcon(proj.id, ts.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove Icon"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <div className="flex flex-col gap-1">
                      <label className="cursor-pointer" title="Upload Techstack Icon">
                        <input type="file" accept="image/*" onChange={(e) => addTechIcon(proj.id, e.target.files[0])} className="hidden" />
                        <div className={`w-8 h-8 rounded-full border border-dashed flex items-center justify-center transition-colors ${isDark ? "border-[#27272a] hover:border-blue-500 hover:text-blue-500 text-neutral-400 bg-[#18181b]" : "border-neutral-300 hover:border-blue-500 hover:text-blue-500 text-neutral-400 bg-neutral-50"}`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                      </label>
                      <button 
                        title="Pick Tech Icon from Library"
                        onClick={() => setPickerTarget(`ts_${proj.id}`)}
                        className={`w-8 h-8 rounded-full border border-dashed flex items-center justify-center transition-colors ${isDark ? "border-[#27272a] hover:border-blue-500 hover:text-blue-500 text-neutral-400 bg-[#18181b]" : "border-neutral-300 hover:border-blue-500 hover:text-blue-500 text-neutral-400 bg-neutral-50"}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
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
            className={`${buttonClass} bg-blue-600 border-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg`}
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
              setNewThumbnailUrl(media.url);
              setNewThumbnailFile(null);
            } else if (pickerTarget.startsWith("ts_")) {
              const projId = pickerTarget.replace("ts_", "");
              setProjects(projects.map(p => {
                if (p.id === projId) {
                  return { ...p, techStack: [...p.techStack, { id: `ts_${Date.now()}`, icon: media.url }] };
                }
                return p;
              }));
            } else {
              // Existing project thumbnail
              updateProject(pickerTarget, 'thumbnail', media.url);
            }
            setPickerTarget(null);
          }}
        />
      )}
    </div>
  );
}
