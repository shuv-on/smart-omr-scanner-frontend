"use client";

import { useState } from "react";
import { 
  ArrowLeft, ScanLine, UploadCloud, FileCheck, X, 
  Microscope, Globe, BookOpen, Monitor, Eye 
} from "lucide-react";
import questionsData from "../../data/questions.json";

export default function ScannerPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showDigitalOMR, setShowDigitalOMR] = useState(false);
  
  const [results, setResults] = useState({ score: 0, correct: 0, wrong: 0, penalty: 0, total: 0, irtScore: 0 });
  const NEGATIVE_MARK = 0.25;

  const categories = [
    { id: "ict", name: "ICT", icon: <Monitor className="h-8 w-8 text-blue-500" />, bgColor: "bg-blue-50", borderColor: "hover:border-blue-500" },
    { id: "science", name: "Science", icon: <Microscope className="h-8 w-8 text-green-500" />, bgColor: "bg-green-50", borderColor: "hover:border-green-500" },
    { id: "gk", name: "General Knowledge", icon: <Globe className="h-8 w-8 text-purple-500" />, bgColor: "bg-purple-50", borderColor: "hover:border-purple-500" },
    { id: "bangla", name: "Bangla", icon: <BookOpen className="h-8 w-8 text-red-500" />, bgColor: "bg-red-50", borderColor: "hover:border-red-500" }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

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

      const response = await fetch("http://localhost:8000/api/scan-omr", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json(); 
      
      if (data.status === "success") {
        setImagePreview(data.processedImage); 
        
        const questions = questionsData[selectedCategory];
        const formattedAnswers = {};
        const backendValues = Object.values(data.detectedAnswers);
        
        questions.forEach((q, idx) => {
           formattedAnswers[q.id] = backendValues[idx] || "NOT_ANSWERED";
        });

        setAnswers(formattedAnswers);
        processResults(formattedAnswers, questions);

      } else {
        alert("Server Error: " + (data.message || "Failed to parse OMR"));
      }
    } catch (error) {
      console.error("OMR Scanning Failed:", error);
      alert("Connection Failed! Python FastAPI সার্ভার (main.py) কি চালু আছে?");
    } finally {
      setIsScanning(false);
    }
  };

  const processResults = (userAnswers, questions) => {
    let correct = 0;
    let wrong = 0;
    
    questions.forEach((q) => {
      if (userAnswers[q.id] && userAnswers[q.id] !== "NOT_ANSWERED") {
        if (userAnswers[q.id] === q.correctAnswer) {
            correct += 1;
        } else {
            wrong += 1;
        }
      }
    });

    const penalty = wrong * NEGATIVE_MARK;
    const finalScore = correct - penalty;

    const accuracy = questions.length > 0 ? (correct / questions.length) : 0;
    let dynamicIrt = (accuracy * 6) - 3; 
    dynamicIrt = parseFloat(dynamicIrt.toFixed(2));

    const savedHistory = JSON.parse(localStorage.getItem("examHistory")) || [];
    const newExam = {
      category: selectedCategory,
      date: new Date().toLocaleDateString(),
      score: finalScore,
      total: questions.length,
      percentage: (finalScore / questions.length) * 100,
      irtScore: dynamicIrt
    };
    localStorage.setItem("examHistory", JSON.stringify([...savedHistory, newExam]));

    setResults({ 
        score: finalScore, 
        correct: correct, 
        wrong: wrong, 
        penalty: penalty, 
        total: questions.length, 
        irtScore: dynamicIrt 
    });
    
    setIsSubmitted(true);
  };

  const resetScanner = () => {
    setSelectedCategory(null); setAnswers({});
    setImagePreview(null); setImageFile(null); setIsSubmitted(false); setShowDigitalOMR(false);
  };

  const DigitalOMRView = () => {
    const questions = questionsData[selectedCategory];
    return (
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-inner border border-gray-200 animate-fade-in-down">
        <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Digital Answer Sheet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="flex items-center gap-4 py-2 border-b border-dashed border-gray-100">
              <span className="w-6 font-bold text-gray-400">{index + 1}.</span>
              <div className="flex gap-3">
                {q.options.map((option, i) => {
                  const optionLetter = String.fromCharCode(65 + i);
                  const isUserSelected = answers[q.id] === optionLetter;
                  const isCorrect = q.correctAnswer === optionLetter;
                  
                  let bubbleClass = "border-2 border-gray-300 text-gray-400";
                  if (isUserSelected && isCorrect) bubbleClass = "bg-green-500 border-green-500 text-white shadow-sm";
                  else if (isUserSelected && !isCorrect) bubbleClass = "bg-red-500 border-red-500 text-white shadow-sm";
                  else if (!isUserSelected && isCorrect) bubbleClass = "border-blue-500 text-blue-600 font-bold";

                  return (
                    <div key={i} className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all ${bubbleClass}`}>
                      {optionLetter}
                    </div>
                  );
                })}
              </div>
              {answers[q.id] && answers[q.id] !== "NOT_ANSWERED" ? (
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
          <button onClick={resetScanner} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-blue-600 transition">
            <ArrowLeft className="h-5 w-5" /> Scan Another OMR
          </button>

          <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg border-t-4 border-blue-500">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Scan Results: {selectedCategory.toUpperCase()}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center mb-6">
              <div className="p-4 bg-blue-50 rounded-xl"><p className="text-xs font-bold text-blue-600 mb-1">SCORE</p><p className="text-3xl font-black text-gray-800">{results.score}</p></div>
              <div className="p-4 bg-green-50 rounded-xl"><p className="text-xs font-bold text-green-600 mb-1">CORRECT</p><p className="text-3xl font-black text-gray-800">{results.correct}</p></div>
              <div className="p-4 bg-red-50 rounded-xl"><p className="text-xs font-bold text-red-600 mb-1">WRONG</p><p className="text-3xl font-black text-gray-800">{results.wrong}</p></div>
              <div className="p-4 bg-orange-50 rounded-xl"><p className="text-xs font-bold text-orange-600 mb-1">TOTAL</p><p className="text-3xl font-black text-gray-800">{results.total}</p></div>
            </div>
            
            <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl text-center mb-6">
                <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-2">AI-Predicted IRT Ability Score</p>
                <p className={`text-5xl font-black ${results.irtScore > 0 ? 'text-green-600' : results.irtScore < 0 ? 'text-red-500' : 'text-purple-800'}`}>
                  {results.irtScore > 0 ? `+${results.irtScore}` : results.irtScore}
                </p>
            </div>

            <button 
              onClick={() => setShowDigitalOMR(!showDigitalOMR)}
              className="mt-4 w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-md"
            >
              <Eye className="h-5 w-5" /> {showDigitalOMR ? "Hide Digital Sheet" : "View Digital Answer Sheet"}
            </button>
            {showDigitalOMR && <DigitalOMRView />}

            {imagePreview && (
               <div className="mt-8 border rounded-xl overflow-hidden shadow-sm">
                   <h3 className="bg-gray-100 p-3 text-center font-bold text-gray-700 border-b">AI Analyzed OMR Image</h3>
                   <div className="flex justify-center p-4 bg-gray-50">
                     <img src={imagePreview} alt="Analyzed OMR" className="max-w-full object-contain max-h-[600px] rounded" />
                   </div>
               </div>
            )}
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
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">AI OMR Scanner</h1>
            <p className="mt-3 text-lg text-gray-500">Select a subject to start scanning</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-blue-600 transition">
          <ArrowLeft className="h-5 w-5" /> Back to Subjects
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
          {isScanning && <p className="text-center mt-4 text-blue-600 font-medium animate-pulse">Analyzing answers through AI Model...</p>}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `@keyframes scan { 0% { transform: translateY(0); } 50% { transform: translateY(320px); } 100% { transform: translateY(0); } }`}} />
    </div>
  );
}