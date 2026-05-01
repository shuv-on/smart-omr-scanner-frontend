"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // চেক করা হচ্ছে ইউজার অলরেডি লগিন করা কি না
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard"); // লগিন করা থাকলে সোজা ড্যাশবোর্ড!
    } else {
      setLoading(false); // লগিন করা না থাকলে ল্যান্ডিং পেজ দেখাও
    }
  }, [router]);

  // যতক্ষণ চেক চলছে, একটা লোডিং দেখাবে (যাতে পেজ লাফ না মারে)
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-3xl text-center">
        
        {/* লোগো বা ব্যাজ */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
          </span>
          Smart OMR System v1.0
        </div>

        {/* মেইন টেক্সট */}
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Automate Your <span className="text-blue-600">Exam Grading</span>
        </h1>
        
        <p className="mb-10 text-lg text-gray-600 sm:text-xl">
          Fast, accurate, and digital OMR evaluation system. 
          Practice exams, track progress, and get instant results.
        </p>

        {/* বাটনসমূহ */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link 
            href="/login"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-95 sm:w-auto"
          >
            Get Started
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link 
            href="/register"
            className="flex w-full items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 sm:w-auto"
          >
            Create Account
          </Link>
        </div>

        {/* কিছু ফিচার পয়েন্ট */}
        <div className="mt-16 grid grid-cols-2 gap-4 text-left sm:flex sm:justify-center sm:gap-8 text-sm font-medium text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" /> Instant Results
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" /> Secure System
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" /> Multiple Categories
          </div>
        </div>

      </div>
    </div>
  );
}