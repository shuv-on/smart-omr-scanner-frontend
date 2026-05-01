"use client"; // Next.js এ ক্লায়েন্ট সাইড ফাংশন (useState, API call) ব্যবহার করতে এটি লাগে

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { User, Mail, Lock, Loader2 } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ব্যাকএন্ডে API কল
      const response = await axios.post("http://localhost:8080/api/auth/register", formData);
      
      // সফল হলে টোকেন লোকাল স্টোরেজে সেভ করা
      localStorage.setItem("token", response.data.token);
      
      toast.success("Registration Successful! 🎉");
      
      // একটু পর লগিন পেজে পাঠিয়ে দেওয়া
      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (error) {
      // ব্যাকএন্ড থেকে এরর আসলে সেটা দেখানো
      toast.error(error.response?.data || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* টোস্ট নোটিফিকেশন সেটআপ */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl sm:p-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-500">Join Smart OMR today to get started.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div className="relative">
            <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-3 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe" 
                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="relative">
            <label className="mb-1 block text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-5 w-5 text-gray-400" />
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com" 
                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="relative">
            <label className="mb-1 block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-5 w-5 text-gray-400" />
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••" 
                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="group relative flex w-full justify-center rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Creating...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}