'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuizSession } from '@/components/contexts/QuizSessionContext';

export default function ScorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sessionResults, validateScoreAccess } = useQuizSession();
  const [isValidAccess, setIsValidAccess] = useState(false);
  
  // Get parameters from URL
  const quizType = searchParams.get('type');
  const selectedExam = searchParams.get('exam');
  const score = searchParams.get('score');
  
  useEffect(() => {
    // Verify this is a legitimate score page access
    const isValid = validateScoreAccess(quizType, selectedExam, score);
    
    if (!isValid) {
      // If someone is trying to access directly without completing a quiz
      router.replace('/dashboard');
      return;
    }
    
    setIsValidAccess(true);
  }, [quizType, selectedExam, score, validateScoreAccess, router]);
  
  if (!isValidAccess) {
    return null; // Don't render anything while checking/redirecting
  }
  
  // Choose which component to render based on quiz type
  const ScoreComponent = quizType === 'mock' 
    ? require('@/components/ScoreMock').default
    : require('@/components/ScorePractice').default;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Quiz Results</h1>
        
        <ScoreComponent 
          score={Number(score)}
          examId={selectedExam}
          sessionData={sessionResults}
        />
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Back to Dashboard
          </button>
          
          <button
            onClick={() => router.push(`/session?type=${quizType}&exam=${selectedExam}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  );
}