"use client";

import { useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LoginForm from "@/components/LoginForm";
import { ShieldIcon } from "@/components/Icons";

export default function AdminLogin() {
  const [theme, setTheme] = useState("dark"); // Defaulting to Dark mode as in reference

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 px-4 select-none ${
        theme === "dark"
          ? "bg-[#09090b] text-[#fafafa]"
          : "bg-[#fafafa] text-[#09090b]"
      }`}
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Premium Theme Switcher Toggler Component */}
      <ThemeSwitcher theme={theme} setTheme={setTheme} />

      {/* Main Login Card container */}
      <div
        className={`w-full max-w-md p-8 rounded-2xl border transition-all duration-500 transform hover:shadow-2xl ${
          theme === "dark"
            ? "bg-[#18181b] border-[#27272a] shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
            : "bg-[#ffffff] border-[#e4e4e7] shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
        }`}
      >
        {/* Title Section */}
        <div className="space-y-2 text-left mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Login to your account</h1>
          <p
            className={`text-sm transition-colors duration-500 ${
              theme === "dark" ? "text-[#a1a1aa]" : "text-[#71717a]"
            }`}
          >
            Enter your email below to login to your account
          </p>
        </div>

        {/* Modular Secure Form Component (using React 19 Form Expressions and Transition logic) */}
        <LoginForm theme={theme} />

        {/* Footer Admin note */}
        <div className="mt-8 text-center">
          <p
            className={`text-xs select-none transition-colors duration-500 opacity-60 ${
              theme === "dark" ? "text-[#a1a1aa]" : "text-[#71717a]"
            }`}
          >
            <ShieldIcon /> Secure Authorized Admin Access Only
          </p>
        </div>
      </div>
    </div>
  );
}
