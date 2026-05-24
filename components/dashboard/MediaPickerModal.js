import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

export default function MediaPickerModal({ theme, onSelect, onClose }) {
  const isDark = theme === "dark";
  const [mediaList, setMediaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/media?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) {
          setMediaList(data.data);
        }
      } catch (error) {
        toast.error("Failed to load media.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedia();
  }, [searchQuery]);

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-4xl max-h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? "bg-[#09090b] border-[#27272a] text-neutral-100" : "bg-white border-neutral-200 text-neutral-900"
      }`}>
        
        {/* Header */}
        <div className={`p-4 border-b flex justify-between items-center ${isDark ? "border-[#27272a]" : "border-neutral-200"}`}>
          <h3 className="font-bold text-lg">Select Media</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-500/20 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className={`p-4 border-b ${isDark ? "border-[#27272a] bg-[#18181b]" : "border-neutral-200 bg-neutral-50"}`}>
          <div className="relative w-full max-w-sm">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2 rounded-lg border text-sm transition-all duration-300 outline-none focus:ring-2 ${
                isDark
                  ? "bg-[#09090b] border-[#27272a] focus:ring-[#3f3f46]"
                  : "bg-[#ffffff] border-[#d4d4d8] focus:ring-[#e4e4e7]"
              }`}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`aspect-square rounded-xl animate-pulse ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}></div>
              ))}
            </div>
          ) : mediaList.length === 0 ? (
            <div className="py-12 text-center opacity-50">
              No media found.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {mediaList.map((media) => (
                <div 
                  key={media.id} 
                  onClick={() => onSelect(media)}
                  className={`group aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                    isDark ? "border-[#27272a] bg-black/40 hover:border-blue-500" : "border-neutral-200 bg-white hover:border-blue-500"
                  }`}
                >
                  <img 
                    src={media.url} 
                    alt={media.name} 
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">SELECT</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
