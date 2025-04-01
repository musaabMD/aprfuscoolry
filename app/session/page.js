'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import QuizPlayerDemo from '@/components/QuizPlayerDemo';

export default function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quizData, setQuizData] = useState(null);
  
  // Get quiz type and exam from URL params
  const quizType = searchParams.get('type'); // 'mock' or 'practice'
  const selectedExam = searchParams.get('exam');
  
  useEffect(() => {
    if (!quizType || !selectedExam) {
      router.push('/');
    }
  }, [quizType, selectedExam, router]);
  
  const handleQuizExit = (results) => {
    if (results?.completed) {
      // Navigate to score page with results
      router.push(`/score?type=${quizType}&exam=${selectedExam}&score=${results.score}`);
    } else {
      // If quiz wasn't completed, go back to previous page
      router.back();
    }
  };
  
  if (!quizType || !selectedExam) return null;
  
  return (
    <div className="min-h-screen">
      <QuizPlayerDemo 
        onExit={handleQuizExit}
        quizType={quizType}
        selectedExam={selectedExam}
      />
    </div>
  );
}