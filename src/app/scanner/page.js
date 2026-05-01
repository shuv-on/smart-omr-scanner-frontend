"use client";

import { useState } from "react";
import { UploadCloud, ScanLine, FileCheck, AlertCircle, X } from "lucide-react";

export default function ScannerPage() {
  const [image, setImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  // ছবি আপলোড হ্যান্ডেল করা
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setResult(null); // নতুন ছবি দিলে আগের রেজাল্ট মুছে যাবে
    }
  };

  // স্ক্যানিং সিমুলেশন
  const handleScan = () => {
    if (!image) return;
    setIsScanning(true);

    // ৩ সেকেন্ডের স্ক্যানিং অ্যানিমেশন
    setTimeout(() => {
      setIsScanning(false);
      // ডামি রেজাল্ট জেনারেট করা
      setResult({
        total: 20,
        correct: 16,
        wrong: 4,
        score: 15, // 16 - (4 * 0.25)
        percentage: 75,
      });
    }, 3000);
  };

  const resetScanner = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
            <ScanLine className="h-8 w-8 text-blue-600" />
            OMR Sheet Scanner
          </h1>
          <p className="mt-2 text-gray-500">Upload an image of your OMR sheet for instant evaluation</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          
          {/* আপলোড এবং প্রিভিউ সেকশন */}
          {!image ? (
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700">Click or drag image to upload</p>
              <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG formats</p>
            </div>
          ) : (
            <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-100 flex justify-center items-center h-96">
              <img src={image} alt="OMR Sheet" className="max-h-full object-contain" />
              
              {/* স্ক্যানিং অ্যানিমেশন (লেজার লাইন) */}
              {isScanning && (
                <div className="absolute inset-0 bg-blue-500/10 z-10 overflow-hidden">
                  <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
              )}

              {/* ছবি সরানোর বাটন */}
              {!isScanning && !result && (
                <button 
                  onClick={resetScanner}
                  className="absolute top-4 right-4 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* অ্যাকশন বাটন */}
          {image && !result && !isScanning && (
            <div className="mt-6 text-center">
              <button
                onClick={handleScan}
                className="flex items-center justify-center gap-2 w-full sm:w-auto mx-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition active:scale-95"
              >
                <ScanLine className="h-5 w-5" /> Start Scanning
              </button>
            </div>
          )}

          {/* লোডিং টেক্সট */}
          {isScanning && (
            <div className="mt-6 text-center text-blue-600 font-medium animate-pulse flex items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              Processing OMR Sheet... Please wait.
            </div>
          )}

          {/* রেজাল্ট সেকশন */}
          {result && (
            <div className="mt-8 p-6 rounded-xl border-2 border-green-100 bg-green-50 animate-fade-in-down">
              <div className="flex items-center gap-3 mb-6 border-b border-green-200 pb-4">
                <FileCheck className="h-8 w-8 text-green-600" />
                <h2 className="text-2xl font-bold text-green-800">Scan Complete!</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 font-semibold uppercase">Total Qs</p>
                  <p className="text-2xl font-black text-gray-800">{result.total}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-green-500 font-semibold uppercase">Correct</p>
                  <p className="text-2xl font-black text-green-600">{result.correct}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-red-500 font-semibold uppercase">Wrong</p>
                  <p className="text-2xl font-black text-red-600">{result.wrong}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border-2 border-blue-100">
                  <p className="text-sm text-blue-600 font-semibold uppercase">Final Score</p>
                  <p className="text-2xl font-black text-blue-600">{result.score}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-4">
                <button onClick={resetScanner} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                  Scan Another
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* কাস্টম অ্যানিমেশন (ফাইলটার নিচেই অ্যাড করা হলো) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(384px); }
          100% { transform: translateY(0); }
        }
      `}} />
    </div>
  );
}