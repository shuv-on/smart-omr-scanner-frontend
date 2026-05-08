"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, LogOut, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Next.js hydration error এড়ানোর জন্য
  useEffect(() => {
    setIsClient(true);
  }, []);

  // লগিন বা রেজিস্টার পেজে আমরা Navbar দেখাবো না
  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!isClient) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* লোগো এবং লিংক */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-600 p-1.5 text-white">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">Smart OMR</span>
            </Link>

            {/* মেনু আইটেম */}
            <div className="hidden md:flex space-x-2">
              <Link 
                href="/dashboard" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === "/dashboard" 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              
              <Link 
                href="/exam" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === "/exam" 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                <BookOpen className="h-4 w-4" /> Exams
              </Link>

              {/* 🚀 নতুন Scanner লিংক যোগ করা হলো */}
              <Link 
                href="/scanner" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === "/scanner" 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                <ScanLine className="h-4 w-4" /> Scanner
              </Link>
            </div>
          </div>

          {/* লগআউট বাটন */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}