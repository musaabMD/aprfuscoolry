import React, { useState, useRef } from 'react';
import { Trophy, Clock, CheckCircle2, XCircle, Share2, User, BookOpen, BarChart3, Home, RefreshCw } from "lucide-react";
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';

// Mock exam context
const ExamContext = React.createContext({ selectedExam: 'CCNA' });
const useExam = () => React.useContext(ExamContext);

// Mock Button component
const Button = ({ children, className, variant, onClick }) => {
  const baseClass = "flex items-center justify-center px-4 py-2 rounded-lg font-medium text-white";
  const variantClass = variant === "outline" 
    ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" 
    : "bg-blue-600 hover:bg-blue-700";
  
  return (
    <button className={`${baseClass} ${variantClass} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

// Mock Link component
const Link = ({ href, children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Mock subject data
const subjectScores = [
  { name: "Network Fundamentals", score: 13, totalQuestions: 15 },
  { name: "Network Access", score: 9, totalQuestions: 12 },
  { name: "IP Connectivity", score: 15, totalQuestions: 18 },
  { name: "IP Services", score: 9, totalQuestions: 10 },
  { name: "Security Fundamentals", score: 7, totalQuestions: 10 },
  { name: "Automation & Programmability", score: 4, totalQuestions: 5 }
];

// Share menu component
const ShareMenu = ({ onClose, examName, score }) => {
  const shareText = `I scored ${score}% on ${examName} exam at Scoorly.com! 🎯`;
  
  const shareOptions = [
    {
      name: 'X (Twitter)',
      icon: '𝕏',
      onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank', 'width=550,height=420'),
      color: 'bg-black hover:bg-gray-900'
    },
    {
      name: 'Facebook',
      icon: 'f',
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`, '_blank', 'width=550,height=420'),
      color: 'bg-[#1877f2] hover:bg-[#166fe5]'
    },
    {
      name: 'Instagram',
      icon: '📸',
      onClick: () => {
        // Instagram doesn't have a direct share URL, so we'll copy the text
        navigator.clipboard.writeText(shareText);
        alert('Text copied! You can now paste it in your Instagram post.');
      },
      color: 'bg-[#E4405F] hover:bg-[#d62e4c]'
    },
    {
      name: 'Snapchat',
      icon: '👻',
      onClick: () => {
        navigator.clipboard.writeText(shareText);
        alert('Text copied! You can now paste it in Snapchat.');
      },
      color: 'bg-[#FFFC00] hover:bg-[#f2ef00] text-black'
    },
    {
      name: 'Download Score',
      icon: '⬇️',
      onClick: async () => {
        try {
          const resultCard = document.getElementById('result-card');
          const canvas = await html2canvas(resultCard, {
            backgroundColor: null,
            scale: 2,
          });
          
          const url = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = url;
          a.download = `${examName.toLowerCase()}-score.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (error) {
          console.error('Error downloading:', error);
          alert('Failed to download image. Please try again.');
        }
      },
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-2">Share Your Results</h3>
        <p className="text-gray-600 mb-4 text-sm">{shareText}</p>
        <div className="space-y-3">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.onClick}
              className={`w-full ${option.color} text-white rounded-lg py-3 px-4 font-medium flex items-center justify-center gap-2 transition-colors`}
            >
              <span className="text-xl">{option.icon}</span>
              Share on {option.name}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Simplified Exam Score Page
const ExamScoreDemo = () => {
  const router = useRouter();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const selectedExam = "CCNA";
  const userName = "John Smith";
  
  // Calculate total score
  const totalQuestions = subjectScores.reduce((total, subject) => {
    return total + subject.totalQuestions;
  }, 0);
  
  const score = subjectScores.reduce((total, subject) => {
    return total + subject.score;
  }, 0);
  
  // Calculate overall percentage
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Check if passed
  const passed = percentage >= 70;
  
  // Calculate subject performance
  const subjectPerformance = {
    excellent: 4,
    good: 0,
    needsImprovement: 0
  };
  
  return (
    <ExamContext.Provider value={{ selectedExam }}>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Section */}
          <div 
            id="result-card"
            className={`bg-gradient-to-r ${passed ? 'from-blue-600 to-blue-800' : 'from-red-600 to-red-700'} rounded-xl shadow-lg overflow-hidden p-8 text-white text-center relative`}
          >
            <div className="absolute top-4 left-4 flex items-center">
              <User className="w-6 h-6 mr-2" />
              <span className="text-lg font-medium">{userName}</span>
            </div>
            <div className="absolute top-4 right-4 flex items-center">
              <BookOpen className="w-6 h-6 mr-2" />
              <span className="text-lg font-medium">{selectedExam}</span>
            </div>
            
            <div className="mt-12">
              <Trophy className="w-20 h-20 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-2">{selectedExam} Results</h1>
              <p className="text-xl text-gray-100 mb-4">
                {passed ? 'Congratulations! You passed the exam!' : 'Keep practicing! You can improve your score!'}
              </p>
              
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="bg-white/20 p-6 rounded-xl text-center backdrop-blur-sm">
                  <div className="text-5xl font-bold mb-2">{percentage}%</div>
                  <div className="text-sm">Final Score</div>
                </div>
                <div className="bg-white/20 p-6 rounded-xl text-center backdrop-blur-sm">
                  <div className="text-5xl font-bold mb-2 flex items-center justify-center">
                    <Clock className="w-8 h-8 mr-2" />
                    <span>1:42:15</span>
                  </div>
                  <div className="text-sm">Time Spent</div>
                </div>
                <div className="bg-white/20 p-6 rounded-xl text-center backdrop-blur-sm">
                  <div className="text-5xl font-bold mb-2">{totalQuestions}</div>
                  <div className="text-sm">Total Questions</div>
                </div>
              </div>
              <div className="mt-6 text-sm text-white/80">Scoorly.com</div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="bg-white shadow-lg rounded-b-xl p-8">
            {/* Performance Summary */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Performance Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-lg">Correct: {score}</span>
                </div>
                <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg">
                  <XCircle className="w-6 h-6" />
                  <span className="text-lg">Incorrect: {totalQuestions - score}</span>
                </div>
                <div className="flex items-center gap-3 text-blue-600 bg-blue-50 p-4 rounded-lg">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-lg">Passing Score: 70%</span>
                </div>
              </div>
            </div>
            
            {/* Subject Scores */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Subject Performance</h2>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="font-bold text-green-600">Excellent</p>
                    <p className="text-3xl font-bold text-green-600">{subjectPerformance.excellent}</p>
                    <p className="text-sm text-gray-600">subjects</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-blue-600">Good</p>
                    <p className="text-3xl font-bold text-blue-600">{subjectPerformance.good}</p>
                    <p className="text-sm text-gray-600">subjects</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-600">Needs Work</p>
                    <p className="text-3xl font-bold text-gray-600">{subjectPerformance.needsImprovement}</p>
                    <p className="text-sm text-gray-600">subjects</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {subjectScores.map((subject, index) => {
                  const subjectPercentage = (subject.score / subject.totalQuestions) * 100;
                  
                  return (
                    <div key={index} className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{subject.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
                            {subject.score}/{subject.totalQuestions}
                          </span>
                          <span className="font-bold">
                            ({Math.round(subjectPercentage)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="h-2.5 rounded-full bg-black" 
                          style={{ width: `${subjectPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {/* Commented out Share Results button
              <Button 
                className="gap-2 text-base py-6 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowShareMenu(true)}
              >
                <Share2 className="w-5 h-5" />
                Share Results
              </Button>
              */}
              
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full gap-2 text-base py-6 bg-blue-600 hover:bg-blue-700"
              >
                <Home className="w-5 h-5" />
                Back to Dashboard
              </Button>
              
              {/* Commented out Try Again button
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full gap-2 text-base py-6 bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </Button>
              */}
            </div>
          </div>
          
          {/* Share Menu Modal */}
          {showShareMenu && (
            <ShareMenu
              onClose={() => setShowShareMenu(false)}
              examName={selectedExam}
              score={percentage}
            />
          )}
        </div>
      </div>
    </ExamContext.Provider>
  );
};

export default ExamScoreDemo;