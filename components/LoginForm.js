"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { MailIcon, LockIcon, EyeOpenIcon, EyeClosedIcon } from "./Icons";

export default function LoginForm({ theme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [totpMode, setTotpMode] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLoginAction = async (formData) => {
    const emailValue = formData.get("email");
    const passwordValue = formData.get("password");

    if (!emailValue || !passwordValue) {
      toast.warning("Please fill in all fields.", {
        classNames: { icon: "text-yellow-500" },
      });
      return;
    }

    if (totpMode && !totpCode) {
      toast.warning("Please enter the 6-digit 2FA code.", {
        classNames: { icon: "text-yellow-500" },
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailValue, password: passwordValue, totpCode: totpMode ? totpCode : undefined }),
        });

        const data = await response.json();

        if (data.requires2FA) {
          setTotpMode(true);
          toast.info("2FA is enabled. Please enter your authenticator code.", {
            classNames: { icon: "text-blue-500" },
          });
          return;
        }

        if (!response.ok || !data.success) {
          toast.error(data.error || "Authentication failed. Please verify credentials.", {
            classNames: { icon: "text-destructive" },
          });
          return;
        }

        toast.success("Login successful! Redirecting to workspace...", {
          classNames: { icon: "text-green-500" },
        });

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1200);
      } catch (err) {
        console.error("Authentication request failed:", err);
        toast.error("Network error. Please check your connection and try again.", {
          classNames: { icon: "text-destructive" },
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <form action={handleLoginAction} className="space-y-6">
        {!totpMode ? (
          <>
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className={`text-sm font-semibold tracking-wide transition-colors duration-500 ${
                  theme === "dark" ? "text-[#e4e4e7]" : "text-[#3f3f46]"
                }`}
              >
                Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 z-10">
                  <MailIcon />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@rishi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  className={`w-full pl-11 pr-3.5 py-2.5 rounded-lg border text-sm transition-all duration-300 outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-[#09090b] border-[#27272a] text-[#ffffff] placeholder-[#52525b] focus:ring-[#3f3f46] focus:border-[#52525b]"
                      : "bg-[#ffffff] border-[#d4d4d8] text-[#09090b] placeholder-[#a1a1aa] focus:ring-[#e4e4e7] focus:border-[#a1a1aa]"
                  }`}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className={`text-sm font-semibold tracking-wide transition-colors duration-500 ${
                    theme === "dark" ? "text-[#e4e4e7]" : "text-[#3f3f46]"
                  }`}
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Password recovery is restricted to secure system environment keys.", {
                      classNames: { icon: "text-violet-500" },
                    });
                  }}
                  className={`text-xs font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity ${
                    theme === "dark" ? "text-[#a1a1aa]" : "text-[#71717a]"
                  }`}
                >
                  Forgot your password?
                </a>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 z-10">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  className={`w-full pl-11 pr-11 py-2.5 rounded-lg border text-sm transition-all duration-300 outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-[#09090b] border-[#27272a] text-[#ffffff] placeholder-[#52525b] focus:ring-[#3f3f46] focus:border-[#52525b]"
                      : "bg-[#ffffff] border-[#d4d4d8] text-[#09090b] placeholder-[#a1a1aa] focus:ring-[#e4e4e7] focus:border-[#a1a1aa]"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150 focus:outline-none cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl text-sm border flex items-center gap-3 ${theme === "dark" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
               <LockIcon />
               <span>Enter the 6-digit code from your Authenticator app.</span>
            </div>
            <div className="space-y-2">
              <label
                className={`text-sm font-semibold tracking-wide transition-colors duration-500 ${
                  theme === "dark" ? "text-[#e4e4e7]" : "text-[#3f3f46]"
                }`}
              >
                Authentication Code
              </label>
              <input
                id="totpCode"
                name="totpCode"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                disabled={isPending}
                className={`w-full px-4 py-3 rounded-lg border text-center tracking-[0.5em] text-xl font-mono transition-all duration-300 outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-[#09090b] border-[#27272a] text-[#ffffff] placeholder-[#52525b] focus:ring-[#3f3f46] focus:border-[#52525b]"
                    : "bg-[#ffffff] border-[#d4d4d8] text-[#09090b] placeholder-[#a1a1aa] focus:ring-[#e4e4e7] focus:border-[#a1a1aa]"
                }`}
                required
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 border cursor-pointer ${
            isPending
              ? "opacity-75 cursor-not-allowed"
              : "hover:scale-[1.01] hover:shadow-md active:scale-[0.99]"
          } ${
            theme === "dark"
              ? "bg-[#ffffff] hover:bg-[#f4f4f5] border-[#ffffff] text-[#09090b]"
              : "bg-[#09090b] hover:bg-[#18181b] border-[#09090b] text-[#ffffff]"
          }`}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Authenticating...
            </span>
          ) : totpMode ? (
            "Verify & Login"
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}
