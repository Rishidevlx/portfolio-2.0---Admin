import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getDbPool } from "@/lib/db";
import { Toaster } from "sonner";

// Automatically verify connection to TiDB Cloud on server startup
getDbPool()
  .then(() => {
    console.log("⚡ TiDB Cloud Status: CONNECTION VERIFIED & ACTIVE! 🟢");
  })
  .catch((err) => {
    console.error("⚡ TiDB Cloud Status: CONNECTION FAILED! 🔴", err.message);
  });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Rishi Portfolio - Admin Portal",
  description: "Secure Content Management System for managing portfolio contents.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-hidden overscroll-none antialiased`}
    >
      <body className="h-full overflow-hidden overscroll-none flex flex-col bg-[#09090b]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

