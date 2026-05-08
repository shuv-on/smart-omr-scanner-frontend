"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, History, ScanLine, Trophy, BookOpen, BrainCircuit } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({ 
    totalExams: 0, 
    averageScore: 0, 
    scannedOMRs: 0,
    averageIrt: 0 
  });
  const [examHistory, setExamHistory] = useState([]);

  useEffect(() => {
    // const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // আপাতত টোকেন চেকিং অফ রাখা হলো যাতে সহজে টেস্ট করতে পারেন। 
    // প্রোডাকশনে যাওয়ার আগে এটা চালু করে দেবেন।
    /*
    if (!token) {
      router.push("/login");
      return;
    }
    */

    if (userData) setUser(JSON.parse(userData));
    
    const savedHistory = JSON.parse(localStorage.getItem("examHistory")) || [];
    setExamHistory(savedHistory);

    if (savedHistory.length > 0) {
      const totalPercentage = savedHistory.reduce((sum, exam) => sum + (exam.percentage || 0), 0);
      const totalIrt = savedHistory.reduce((sum, exam) => sum + (exam.irtScore || 0), 0);
      
      setStats({
        totalExams: savedHistory.length,
        averageScore: Math.round(totalPercentage / savedHistory.length),
        scannedOMRs: savedHistory.length,
        averageIrt: (totalIrt / savedHistory.length).toFixed(2) // IRT Average
      });
    }
    
    setLoading(false);
  }, [router]);

  // টেস্ট করার জন্য ডামি ডাটা ফাংশন
  const addDummyData = () => {
    const dummy = {
      category: "Science",
      date: new Date().toLocaleDateString(),
      score: 7,
      total: 10,
      percentage: 70,
      irtScore: 6.85
    };
    const newHistory = [...examHistory, dummy];
    localStorage.setItem("examHistory", JSON.stringify(newHistory));
    window.location.reload(); 
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
            <div className="flex items-center gap-5">
              <div className="bg-blue-100 p-1 rounded-full">
                <UserCircle className="h-16 w-16 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Hello, {user?.name || "Student"}! 👋
                </h1>
                <p className="text-gray-500 font-medium">{user?.email || "student@example.com"}</p>
              </div>
            </div>
            <button 
              onClick={addDummyData}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all"
            >
              + Add Dummy OMR Data
            </button>
          </div>

          {/* স্ট্যাটস গ্রিড (৪টা বক্স করা হলো) */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/30 p-6">
              <BookOpen className="absolute -right-4 -bottom-4 h-24 w-24 text-blue-100" />
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Total Exams</h3>
              <p className="mt-3 text-5xl font-black text-blue-700">{stats.totalExams}</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-green-100 bg-green-50/30 p-6">
              <ScanLine className="absolute -right-4 -bottom-4 h-24 w-24 text-green-100" />
              <h3 className="text-sm font-bold text-green-600 uppercase tracking-wider">OMR Scanned</h3>
              <p className="mt-3 text-5xl font-black text-green-700">{stats.scannedOMRs}</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-purple-50/30 p-6">
              <Trophy className="absolute -right-4 -bottom-4 h-24 w-24 text-purple-100" />
              <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider">Avg. Raw Score</h3>
              <p className="mt-3 text-5xl font-black text-purple-700">{stats.averageScore}%</p>
            </div>

            {/* নতুন IRT বক্স */}
            <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 shadow-sm">
              <BrainCircuit className="absolute -right-4 -bottom-4 h-24 w-24 text-indigo-100" />
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Avg. IRT Ability</h3>
              <p className="mt-3 text-5xl font-black text-indigo-700">{stats.averageIrt}</p>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <History className="h-6 w-6 text-blue-500" /> OMR Exam History
              </h2>
            </div>

            {examHistory.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Subject</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Raw Score</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-indigo-600 uppercase">IRT Ability Score</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {examHistory.slice().reverse().map((exam, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-800 capitalize">{exam.category}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-sm">{exam.date}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-center font-bold text-gray-700">{exam.score} / {exam.total}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-center font-black text-indigo-600">{exam.irtScore || "N/A"}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-bold ${
                            exam.percentage >= 80 ? 'bg-green-100 text-green-700' :
                            exam.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {exam.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No OMR scans yet</h3>
                <p className="text-gray-500">Go to scanner and upload an OMR sheet to see your AI-based IRT progress here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}