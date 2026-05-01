"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Clock, Monitor, ScanLine, 
  UploadCloud, FileCheck, X, Microscope, Globe, BookOpen, Eye 
} from "lucide-react";
import questionsData from "../../data/questions.json";

export default function ExamPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [examMode, setExamMode] = useState(null);
  const [showDigitalOMR, setShowDigitalOMR] = useState(false);

  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // ছবির ফাইল ও প্রিভিউ স্টেট
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const [results, setResults] = useState({ score: 0, correct: 0, wrong: 0, penalty: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef(null);
  const NEGATIVE_MARK = 0.25;

  const categories = [
    { id: "ict", name: "ICT", icon: <Monitor className="h-8 w-8 text-blue-500" />, desc: "Information & Technology", bgColor: "bg-blue-50", borderColor: "hover:border-blue-500" },
    { id: "science", name: "Science", icon: <Microscope className="h-8 w-8 text-green-500" />, desc: "Physics, Chem, Biology", bgColor: "bg-green-50", borderColor: "hover:border-green-500" },
    { id: "gk", name: "General Knowledge", icon: <Globe className="h-8 w-8 text-purple-500" />, desc: "World & Bangladesh", bgColor: "bg-purple-50", borderColor: "hover:border-purple-500" },
    { id: "bangla", name: "Bangla", icon: <BookOpen className="h-8 w-8 text-red-500" />, desc: "Literature & Grammar", bgColor: "bg-red-50", borderColor: "hover:border-red-500" }
  ];

  useEffect(() => {
    if (examMode === 'online' && !isSubmitted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isSubmitted && examMode === 'online') {
      handleOnlineSubmit();
    }
    return () => clearInterval(timerRef.current);
  }, [examMode, isSubmitted, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const switchToScan = () => {
    setImagePreview(null);
    setImageFile(null);
    setIsScanning(false);
    setExamMode('scan');
  };

  const handleOnlineSubmit = () => {
    if (isSubmitted) return;
    clearInterval(timerRef.current);
    const currentQuestions = questionsData[selectedCategory];
    processResults(answers, currentQuestions, false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  // ==========================================
  // OMR Scanner Logic (Spring Boot API Connection)
  // ==========================================
  const handleOMRScan = async () => {
    if (!imageFile) {
      alert("Please upload an image first!");
      return;
    }
    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append("omrImage", imageFile);
      formData.append("category", selectedCategory);

      const response = await fetch("http://localhost:8080/api/omr/scan", {
        method: "POST",
        body: formData,
      });
      
      // --- এই অংশটুকু নতুন আপডেট করা হয়েছে ---
      const text = await response.text(); // সরাসরি JSON না পড়ে আগে Text হিসেবে পড়া হচ্ছে
      
      if (!text) {
        alert(`Server blocked the request or returned empty! (Status: ${response.status})`);
        setIsScanning(false);
        return;
      }
      
      const data = JSON.parse(text); // টেক্সট ঠিক থাকলে তারপর JSON-এ কনভার্ট করা হচ্ছে
      // ----------------------------------------
      
      if (data.status === "success") {
        setAnswers(data.detectedAnswers); 
        processResults(data.detectedAnswers, questionsData[selectedCategory], true);
      } else {
        alert("Server Error: " + (data.message || "Failed to parse OMR"));
      }
    } catch (error) {
      console.error("OMR Scanning Failed:", error);
      alert("Connection Failed! Spring Boot সার্ভার কি চালু আছে?");
    } finally {
      setIsScanning(false);
    }
  };

  const processResults = (userAnswers, questions, isOMR) => {
    let correct = 0;
    let wrong = 0;
    
    questions.forEach((q) => {
      // JSON-এর প্রশ্নের id এবং উত্তরের key মিলতে হবে (যেমন: "q1", "q2")
      if (userAnswers[q.id]) {
        if (userAnswers[q.id] === q.correctAnswer) correct += 1;
        else wrong += 1;
      }
    });

    const penalty = wrong * NEGATIVE_MARK;
    const finalScore = correct - penalty;

    setResults({ score: finalScore, correct, wrong, penalty, total: questions.length });
    setIsSubmitted(true);
  };

  const resetExam = () => {
    setSelectedCategory(null); setExamMode(null); setAnswers({});
    setImagePreview(null); setImageFile(null); setIsSubmitted(false); setShowDigitalOMR(false); setTimeLeft(600);
  };

  const DigitalOMRView = () => {
    const questions = questionsData[selectedCategory];
    return (
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-inner border border-gray-200 animate-fade-in-down">
        <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Regenerated OMR Sheet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="flex items-center gap-4 py-2 border-b border-dashed border-gray-100">
              <span className="w-6 font-bold text-gray-400">{index + 1}.</span>
              <div className="flex gap-3">
                {q.options.map((option, i) => {
                  const isUserSelected = answers[q.id] === option;
                  const isCorrect = q.correctAnswer === option;
                  
                  let bubbleClass = "border-2 border-gray-300 text-gray-400";
                  if (isUserSelected && isCorrect) bubbleClass = "bg-green-500 border-green-500 text-white shadow-sm";
                  else if (isUserSelected && !isCorrect) bubbleClass = "bg-red-500 border-red-500 text-white shadow-sm";
                  else if (!isUserSelected && isCorrect) bubbleClass = "border-blue-500 text-blue-600 font-bold";

                  return (
                    <div key={i} className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all ${bubbleClass}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  );
                })}
              </div>
              {answers[q.id] ? (
                answers[q.id] === q.correctAnswer ? 
                <FileCheck className="h-4 w-4 text-green-500 ml-auto" /> : 
                <X className="h-4 w-4 text-red-500 ml-auto" />
              ) : <span className="text-[10px] text-gray-300 ml-auto italic">Left</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="mx-auto max-w-3xl">
          <button onClick={resetExam} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-blue-600 transition">
            <ArrowLeft className="h-5 w-5" /> Take Another Exam
          </button>

          <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg border-t-4 border-green-500">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Results: {selectedCategory.toUpperCase()}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
              <div className="p-4 bg-blue-50 rounded-xl"><p className="text-xs font-bold text-blue-600 mb-1">SCORE</p><p className="text-3xl font-black text-gray-800">{results.score}</p></div>
              <div className="p-4 bg-green-50 rounded-xl"><p className="text-xs font-bold text-green-600 mb-1">CORRECT</p><p className="text-3xl font-black text-gray-800">{results.correct}</p></div>
              <div className="p-4 bg-red-50 rounded-xl"><p className="text-xs font-bold text-red-600 mb-1">WRONG</p><p className="text-3xl font-black text-gray-800">{results.wrong}</p></div>
              <div className="p-4 bg-orange-50 rounded-xl"><p className="text-xs font-bold text-orange-600 mb-1">TOTAL</p><p className="text-3xl font-black text-gray-800">{results.total}</p></div>
            </div>
            
            <button 
              onClick={() => setShowDigitalOMR(!showDigitalOMR)}
              className="mt-8 w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-md"
            >
              <Eye className="h-5 w-5" /> {showDigitalOMR ? "Hide Marked OMR" : "View Marked OMR"}
            </button>
            {showDigitalOMR && <DigitalOMRView />}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Select Subject</h1>
            <p className="mt-3 text-lg text-gray-500">Choose a category to start your exam or scan OMR</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {categories.map((cat) => (
              <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`group cursor-pointer rounded-2xl bg-white p-6 shadow-sm border-2 border-transparent transition-all hover:shadow-md ${cat.borderColor}`}>
                <div className="flex items-center gap-5">
                  <div className={`rounded-2xl ${cat.bgColor} p-4 group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedCategory && !examMode) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="mx-auto max-w-3xl">
          <button onClick={resetExam} className="flex items-center gap-2 text-gray-500 mb-8 hover:text-blue-600 transition"><ArrowLeft className="h-5 w-5" /> Back to Subjects</button>
          <div className="grid gap-6 sm:grid-cols-2">
            <div onClick={() => setExamMode('online')} className="cursor-pointer group bg-white p-8 rounded-2xl shadow-sm text-center border-2 border-transparent hover:border-blue-500 transition-all">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform"><Monitor className="h-8 w-8" /></div>
              <h3 className="text-xl font-bold text-gray-900">Take Online</h3>
            </div>
            <div onClick={() => setExamMode('scan')} className="cursor-pointer group bg-white p-8 rounded-2xl shadow-sm text-center border-2 border-transparent hover:border-green-500 transition-all">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 group-hover:scale-110 transition-transform"><ScanLine className="h-8 w-8" /></div>
              <h3 className="text-xl font-bold text-gray-900">Upload OMR</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (examMode === 'online') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="sticky top-20 z-40 mb-6 flex items-center justify-between rounded-xl bg-white p-4 shadow-md border-l-4 border-blue-600">
            <button onClick={() => setExamMode(null)} className="flex items-center gap-2 text-gray-600 font-medium">
              <ArrowLeft className="h-5 w-5" /> Back
            </button>
            <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
              <Clock className="h-5 w-5" /> {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="space-y-6">
            {questionsData[selectedCategory].map((q, index) => (
              <div key={q.id} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{index + 1}. {q.question}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {q.options.map((option, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setAnswers({ ...answers, [q.id]: option })} 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${answers[q.id] === option ? "border-blue-500 bg-blue-50 font-medium" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
            <button onClick={handleOnlineSubmit} className="w-full sm:flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition">
              Submit Exam
            </button>
            <span className="text-gray-400 font-bold">OR</span>
            <button onClick={switchToScan} className="w-full sm:flex-1 py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
              <ScanLine className="h-6 w-6" /> Upload OMR
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (examMode === 'scan') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="mx-auto max-w-3xl">
          <button onClick={() => setExamMode(null)} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-blue-600 transition">
            <ArrowLeft className="h-5 w-5" /> Back
          </button>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Upload Your <span className="uppercase text-blue-600">{selectedCategory}</span> OMR</h2>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center relative hover:bg-gray-50 transition">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="font-medium text-gray-600">Click or drag to upload OMR Image</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden h-80 bg-gray-100 flex items-center justify-center">
                <img src={imagePreview} className="max-h-full object-contain" alt="OMR" />
                {isScanning && (
                  <div className="absolute inset-0 bg-blue-500/10 z-10 overflow-hidden">
                    <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_blue] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                )}
                {!isScanning && <button onClick={() => {setImagePreview(null); setImageFile(null);}} className="absolute top-4 right-4 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"><X className="h-5 w-5" /></button>}
              </div>
            )}
            {imagePreview && !isScanning && (
              <button onClick={handleOMRScan} className="mt-6 w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg">
                <ScanLine className="h-5 w-5" /> Start Analyzing
              </button>
            )}
            {isScanning && <p className="text-center mt-4 text-blue-600 font-medium animate-pulse">Analyzing answers through Spring Boot...</p>}
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `@keyframes scan { 0% { transform: translateY(0); } 50% { transform: translateY(320px); } 100% { transform: translateY(0); } }`}} />
      </div>
    );
  }
}