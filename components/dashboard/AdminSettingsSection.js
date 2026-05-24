"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminSettingsSection({ theme, inputClass, buttonClass }) {
  const isDark = theme === "dark";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 2FA Setup State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [tempSecret, setTempSecret] = useState("");
  const [totpInput, setTotpInput] = useState("");

  useEffect(() => {
    fetch("/api/adminsettings")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmail(data.data.email);
          setIs2FAEnabled(data.data.is2FAEnabled);
        }
      });
  }, []);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email cannot be empty.");
    
    try {
      const res = await fetch("/api/adminsettings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_email", newEmail: email })
      });
      const data = await res.json();
      if (data.success) toast.success("Email successfully updated.");
      else toast.error(data.error || "Failed to update email.");
    } catch {
      toast.error("Network error.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      return toast.error("Please fill in all password fields.");
    }
    if (passwords.new !== passwords.confirm) {
      return toast.error("New passwords do not match.");
    }
    if (passwords.new.length < 8) {
      return toast.error("Password must be at least 8 characters long.");
    }
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/adminsettings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "update_password", 
          currentPassword: passwords.current,
          newPassword: passwords.new 
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password successfully updated.");
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        toast.error(data.error || "Failed to update password.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggle2FA = async () => {
    if (is2FAEnabled) {
      // Disable 2FA
      try {
        const res = await fetch("/api/adminsettings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "disable_2fa" })
        });
        const data = await res.json();
        if (data.success) {
          setIs2FAEnabled(false);
          toast.success("2FA Disabled. Your account is less secure.");
        }
      } catch {
        toast.error("Failed to disable 2FA.");
      }
    } else {
      // Enable 2FA Setup
      try {
        const res = await fetch("/api/adminsettings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "setup_2fa" })
        });
        const data = await res.json();
        if (data.success) {
          setQrCodeUrl(data.data.qrCodeUrl);
          setTempSecret(data.data.secret);
          setShow2FAModal(true);
        }
      } catch {
        toast.error("Failed to initiate 2FA setup.");
      }
    }
  };

  const verifyAndEnable2FA = async () => {
    if (totpInput.length < 6) return toast.error("Enter a valid 6-digit code.");
    try {
      const res = await fetch("/api/adminsettings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_2fa", secret: tempSecret, token: totpInput })
      });
      const data = await res.json();
      if (data.success) {
        setIs2FAEnabled(true);
        setShow2FAModal(false);
        setTotpInput("");
        toast.success("2FA successfully enabled!");
      } else {
        toast.error(data.error || "Invalid verification code.");
      }
    } catch {
      toast.error("Network error.");
    }
  };



  const handleLogout = () => {
    // Usually you call a /api/auth/logout endpoint or clear cookie
    document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    toast.success("Logged out successfully.");
    router.push("/");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Email Configuration */}
      <div className={`p-6 rounded-xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-white border-neutral-200"}`}>
        <div className="mb-6 border-b pb-4 border-neutral-200 dark:border-[#27272a]">
          <h3 className="text-sm font-bold opacity-90 flex items-center gap-2">
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Configuration
          </h3>
          <p className="text-xs opacity-60 mt-1">Update your primary administrative email address.</p>
        </div>
        
        <form onSubmit={handleEmailChange} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="space-y-2 flex-1 w-full">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70">Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass} 
              placeholder="admin@example.com"
            />
          </div>
          <button type="submit" className={buttonClass}>
            Update Email
          </button>
        </form>
      </div>

      {/* Security & Password */}
      <div className={`p-6 rounded-xl border ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-white border-neutral-200"}`}>
        <div className="mb-6 border-b pb-4 border-neutral-200 dark:border-[#27272a]">
          <h3 className="text-sm font-bold opacity-90 flex items-center gap-2">
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security Credentials
          </h3>
          <p className="text-xs opacity-60 mt-1">Change your password and manage authentication methods.</p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div className="space-y-2 max-w-md">
            <label className="text-xs font-bold uppercase tracking-wider opacity-70">Current Password</label>
            <input 
              type="password" 
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              className={inputClass} 
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">New Password</label>
              <input 
                type="password" 
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                className={inputClass} 
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Confirm New Password</label>
              <input 
                type="password" 
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                className={inputClass} 
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isLoading} className={buttonClass}>
              {isLoading ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication (2FA) */}
      <div className={`p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-white border-neutral-200"}`}>
        <div>
          <h3 className="text-sm font-bold opacity-90 flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 opacity-70 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Two-Factor Authentication (2FA)
          </h3>
          <p className="text-xs opacity-60 max-w-md">Add an extra layer of security to your admin account by requiring a code from an authenticator app upon login.</p>
        </div>
        
        <button 
          onClick={toggle2FA}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${is2FAEnabled ? 'bg-blue-500' : isDark ? 'bg-neutral-700' : 'bg-neutral-300'}`}
          role="switch" 
          aria-checked={is2FAEnabled}
        >
          <span 
            aria-hidden="true" 
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${is2FAEnabled ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      {/* Danger Zone */}
      <div className="pt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-4 px-1">Danger Zone</h3>
        <div className={`p-6 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6`}>
          <div>
            <h4 className="text-sm font-bold text-red-500 dark:text-red-400 mb-1">Terminate Session</h4>
            <p className="text-xs text-red-500/70 max-w-md">Log out from your current administrative session. You will need to re-authenticate to access the CMS again.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Logout Securely
          </button>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl p-8 ${isDark ? "bg-[#09090b] border border-[#27272a]" : "bg-white border border-neutral-200"} shadow-2xl`}>
            <h3 className="text-xl font-bold text-center mb-2">Setup 2FA</h3>
            <p className="text-xs opacity-70 text-center mb-6">Scan this QR code with Google Authenticator or Authy to link your account.</p>
            
            <div className="flex justify-center mb-6 bg-white p-4 rounded-xl">
              {qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />}
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={totpInput}
                onChange={(e) => setTotpInput(e.target.value)}
                maxLength={6}
                className={`w-full text-center tracking-[0.5em] text-xl font-mono ${inputClass}`}
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShow2FAModal(false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold border ${isDark ? "border-[#27272a] hover:bg-[#27272a]" : "border-neutral-200 hover:bg-neutral-100"}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={verifyAndEnable2FA}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-blue-500 text-white hover:bg-blue-600"
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
