import React from "react";
import { SunIcon, MoonIcon } from "./Icons";

export default function ThemeSwitcher({ theme, setTheme }) {
  return (
    <div className="absolute top-6 right-6 flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Theme:</span>
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer ${
          theme === "dark"
            ? "bg-[#18181b] border-[#27272a] text-[#ffffff] hover:bg-[#27272a]"
            : "bg-[#ffffff] border-[#e4e4e7] text-[#09090b] hover:bg-[#f4f4f5]"
        }`}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>
    </div>
  );
}
