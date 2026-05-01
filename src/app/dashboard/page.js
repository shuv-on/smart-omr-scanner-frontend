"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, History } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ড্যাশবোর্ডের ডাটা রাখার জন্য স্টেট
  const [stats, setStats] = useState({ totalExams: 0, averageScore: 0 });
  const [examHistory, setExamHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
    } else {
      if (userData) setUser(JSON.parse(userData));
      
      // লোকাল স্টোরেজ থেকে পরীক্ষার হিস্ট্রি আনা
      const history = JSON.parse(localStorage.getItem("examHistory")) || [];
      setExamHistory(history);

      // গড় মার্কস এবং মোট পরীক্ষা ক্যালকুলেট করা
      if (history.length > 0) {
        const totalPercentage = history.reduce((sum, exam) => sum + exam.percentage, 0);
        setStats({
          totalExams: history.length,
          averageScore: Math.round(totalPercentage / history.length)
        });
      }
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          {/* প্রোফাইল হেডার */}
          <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
            <UserCircle className="h-16 w-16 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name || "User"}! 👋
              </h1>
              <p className="text-gray-500">{user?.email}</p>
              <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {user?.role || "STUDENT"}
              </span>
            </div>
          </div>

          {/* স্ট্যাটিস্টিকস কার্ড */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-6 transition-all hover:shadow-md hover:border-blue-200">
              <h3 className="text-lg font-semibold text-gray-600">Total Exams Taken</h3>
              <p className="mt-2 text-4xl font-extrabold text-blue-600">{stats.totalExams}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 transition-all hover:shadow-md hover:border-green-200">
              <h3 className="text-lg font-semibold text-gray-600">Scanned OMRs</h3>
              <p className="mt-2 text-4xl font-extrabold text-green-500">0</p>
              <p className="text-sm text-gray-400 mt-1">Coming Soon...</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 transition-all hover:shadow-md hover:border-purple-200">
              <h3 className="text-lg font-semibold text-gray-600">Average Score</h3>
              <p className="mt-2 text-4xl font-extrabold text-purple-600">{stats.averageScore}%</p>
            </div>
          </div>

          {/* সাম্প্রতিক পরীক্ষার হিস্ট্রি */}
          {examHistory.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-gray-500" /> Recent Exams
              </h2>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {examHistory.slice().reverse().map((exam, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{exam.category}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-gray-500">{exam.date}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-gray-900">{exam.score} / {exam.total}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            exam.percentage >= 80 ? 'bg-green-100 text-green-800' :
                            exam.percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {exam.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}