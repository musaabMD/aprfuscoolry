'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MockExamPlayer from '@/components/MockExamPlayer';
import { useQuizSession } from '@/components/contexts/QuizSessionContext';

export default function MockSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startQuizSession, completeQuizSession, currentSession } = useQuizSession();
  
  // Get exam from URL params
  const selectedExam = searchParams.get('exam');

  useEffect(() => {
    if (!selectedExam) {
      router.push('/dashboard');
      return;
    }
    
    // Initialize the quiz session
    const initSession = async () => {
      try {
        await startQuizSession('mock', selectedExam);
      } catch (error) {
        console.error('Error starting mock session:', error);
        router.push('/dashboard');
      }
    };
    
    if (!currentSession) {
      initSession();
    }
  }, [selectedExam, router, startQuizSession, currentSession]);

  const handleQuizExit = async (results) => {
    if (results?.completed) {
      try {
        const completedSession = await completeQuizSession(
          results.score,
          results.timeSpent,
          results.totalQuestions
        );
        
        // Navigate to score page with session data
        router.push(`/score/mock?score=${results.score}&totalQuestions=${results.totalQuestions}&timeSpent=${results.timeSpent}&sessionId=${completedSession.id}`);
      } catch (error) {
        console.error('Error completing mock exam:', error);
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  };

  if (!selectedExam || !currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full">
      <MockExamPlayer
        onExit={handleQuizExit}
        selectedExam={selectedExam}
      />
    </div>
  );
}
