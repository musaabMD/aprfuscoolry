'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function ScorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const quizType = searchParams.get('type');
  const selectedExam = searchParams.get('exam');
  const score = searchParams.get('score');

  useEffect(() => {
    if (!quizType || !selectedExam || !score) {
      router.push('/');
    }
  }, [quizType, selectedExam, score, router]);

  const handleBackToHome = () => {
    router.push('/');
  };

  if (!quizType || !selectedExam || !score) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Exam Type</p>
              <p className="font-semibold">{selectedExam} - {quizType}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Your Score</p>
              <p className="text-3xl font-bold text-green-700">{score}%</p>
            </div>
          </div>

          <Button 
            className="w-full mt-8"
            onClick={handleBackToHome}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
