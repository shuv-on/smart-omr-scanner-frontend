"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Monitor, Microscope, Globe, BookOpen, Clock, AlertTriangle } from "lucide-react";
import questionsData from "../../data/questions.json";

export default function ExamPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState({ score: 0, correct: 0, wrong: 0, penalty: 0 });
  
  // টাইমার স্টেট (১০ মিনিট = ৬০০ সেকেন্ড)
  const [timeLeft, setTimeLeft] = useState(600); 
  const timerRef = useRef(null);

  const NEGATIVE_MARK = 0.25; // প্রতি ভুল উত্তরের জন্য ০.২৫ কাটা যাবে

  // টাইমার শুরু করা
  useEffect(() => {
    if (selectedCategory && !isSubmitted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit(); // সময় শেষ হলে অটো সাবমিট
    }

    return () => clearInterval(timerRef.current);
  }, [selectedCategory, isSubmitted, timeLeft]);

  // সময় ফরম্যাট করা (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (questionId, selectedOption) => {
    if (!isSubmitted) {
      setAnswers({ ...answers, [questionId]: selectedOption });
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    
    clearInterval(timerRef.current);
    let correct = 0;
    let wrong = 0;
    const currentQuestions = questionsData[selectedCategory];
    
    currentQuestions.forEach((q) => {
      if (answers[q.id]) {
        if (answers[q.id] === q.correctAnswer) {
          correct += 1;
        } else {
          wrong += 1;
        }
      }
    });

    const penalty = wrong * NEGATIVE_MARK;
    const finalScore = correct - penalty;
    const percentage = Math.max(0, Math.round((finalScore / currentQuestions.length) * 100));

    setResults({ score: finalScore, correct, wrong, penalty });
    setIsSubmitted(true);

    // লোকাল স্টোরেজে রেজাল্ট সেভ
    const newRecord = {
      category: selectedCategory.toUpperCase(),
      score: finalScore,
      total: currentQuestions.length,
      percentage: percentage,
      date: new Date().toLocaleDateString()
    };
    const history = JSON.parse(localStorage.getItem("examHistory")) || [];
    localStorage.setItem("examHistory", JSON.stringify([...history, newRecord]));
  };

  const resetExam = () => {
    setSelectedCategory(null);
    setAnswers({});
    setIsSubmitted(false);
    setTimeLeft(600);
  };

  // --- ক্যাটাগরি সিলেকশন স্ক্রিন ---
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-10">Select Subject</h1>
          <div className="grid gap-6 sm:grid-cols-2">
            {["ict", "science", "gk", "bangla"].map((id) => (
              <div key={id} onClick={() => setSelectedCategory(id)} className="cursor-pointer rounded-2xl bg-white p-6 shadow-sm border hover:border-blue-500 transition-all">
                <h3 className="text-xl font-bold uppercase text-blue-600">{id}</h3>
                <p className="text-gray-500 text-sm">10 Minutes • -0.25 Negative Mark</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-3xl">
        
        {/* টাইমার এবং হেডার */}
        <div className="sticky top-20 z-40 mb-6 flex items-center justify-between rounded-xl bg-white p-4 shadow-md border-l-4 border-blue-600">
          <button onClick={resetExam} className="flex items-center gap-2 text-gray-600 font-medium">
            <ArrowLeft className="h-5 w-5" /> Quit
          </button>
          
          <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* রেজাল্ট কার্ড */}
        {isSubmitted && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg border-t-4 border-green-500">
            <h2 className="text-2xl font-bold text-center mb-4">Exam Result</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-bold uppercase">Final Score</p>
                <p className="text-2xl font-black">{results.score}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-bold uppercase">Correct</p>
                <p className="text-2xl font-black">{results.correct}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 font-bold uppercase">Wrong</p>
                <p className="text-2xl font-black">{results.wrong}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-600 font-bold uppercase">Penalty</p>
                <p className="text-2xl font-black">-{results.penalty}</p>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center gap-1">
              <AlertTriangle className="h-4 w-4" /> Each wrong answer deducted 0.25 marks.
            </p>
          </div>
        )}

        {/* প্রশ্নপত্র */}
        <div className="space-y-6">
          {questionsData[selectedCategory].map((q, index) => (
            <div key={q.id} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{index + 1}. {q.question}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {q.options.map((option, idx) => {
                  const isSelected = answers[q.id] === option;
                  const isCorrect = q.correctAnswer === option;
                  let colorClass = isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200";
                  
                  if (isSubmitted) {
                    if (isCorrect) colorClass = "border-green-500 bg-green-50 text-green-700";
                    else if (isSelected) colorClass = "border-red-500 bg-red-50 text-red-700";
                    else colorClass = "opacity-50";
                  }

                  return (
                    <div key={idx} onClick={() => handleOptionSelect(q.id, option)} className={`p-4 border rounded-lg cursor-pointer transition-all ${colorClass}`}>
                      {option}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!isSubmitted && (
          <button onClick={handleSubmit} className="mt-8 w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition">
            Submit Exam
          </button>
        )}
      </div>
    </div>
  );
}