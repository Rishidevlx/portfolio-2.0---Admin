"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

export default function MediaLibrarySection({ theme, inputClass, buttonClass }) {
  const isDark = theme === "dark";
  const [mediaList, setMediaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all media
  const fetchMedia = async (query = "") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/media?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setMediaList(data.data);
      }
    } catch (error) {
      toast.error("Failed to load media library.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(searchQuery);
  }, [searchQuery]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading to Media Library...");

    try {
      // In a real scenario, this uploads to Cloudinary/S3.
      // Here we simulate it by using createObjectURL for immediate UI feedback 
      // while also posting to our mock database API.
      const fakeUrl = URL.createObjectURL(file);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("type", file.type.startsWith("image/") ? "image" : "document");
      
      // Simulating a real upload delay
      await new Promise(r => setTimeout(r, 1000));

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        // Use the fake local URL for UI immediate preview, since our mock backend returns a dummy url
        const newMedia = { ...data.data, url: fakeUrl }; 
        setMediaList([newMedia, ...mediaList]);
        toast.success("Media uploaded successfully!", { id: toastId, classNames: { icon: "text-green-500" } });
      } else {
        toast.error("Failed to upload media", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error during upload.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this media? It may break links if used elsewhere.")) return;

    try {
      const res = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setMediaList(mediaList.filter(m => m.id !== id));
        toast.success("Media deleted successfully", { classNames: { icon: "text-green-500" } });
      } else {
        toast.error("Failed to delete media.");
      }
    } catch (error) {
      toast.error("Network error.");
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.info("Copied media URL to clipboard!");
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
      
      {/* Top Action Bar */}
      <div className={`p-4 rounded-xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-neutral-50 border-neutral-200"} flex flex-col sm:flex-row gap-4 justify-between items-center`}>
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search media..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>

        {/* Upload Button */}
        <div className="w-full sm:w-auto">
          <label className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer shadow-md ${
            isDark ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-600 text-white hover:bg-blue-700"
          } ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}>
            {isUploading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            )}
            <span>Upload New Media</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`aspect-square rounded-xl animate-pulse ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}></div>
          ))}
        </div>
      ) : mediaList.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-neutral-300 dark:border-[#27272a]">
          <svg className="w-12 h-12 mx-auto opacity-30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <h4 className="text-sm font-bold opacity-80 mb-1">Library is Empty</h4>
          <p className="text-xs opacity-50 max-w-sm mx-auto">Upload images, icons, or logos to use them across your portfolio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map((media) => (
            <div key={media.id} className={`group relative aspect-square rounded-xl overflow-hidden border ${isDark ? "border-[#27272a] bg-black/40" : "border-neutral-200 bg-white"} shadow-sm transition-all hover:shadow-md hover:border-blue-500`}>
              
              <img 
                src={media.url} 
                alt={media.name} 
                className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMSAxNWwtNS01TDUgMjBtMTQtMTB2MTJhMiAyIDAgMCAxLTIgMkgzYTIgMiAwIDAgMS0yLTJWNmEyIDIgMCAwIDEgMi0yaDEzbTIgMmwtNC00LTIgMiIvPjwvc3ZnPg==";
                }}
              />

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end gap-1">
                  <button onClick={() => copyToClipboard(media.url)} className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/40 transition-colors backdrop-blur-sm" title="Copy URL">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(media.id)} className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors backdrop-blur-sm" title="Delete">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="text-[9px] font-medium text-white truncate px-1 bg-black/50 py-1 rounded backdrop-blur-sm">
                  {media.name}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
