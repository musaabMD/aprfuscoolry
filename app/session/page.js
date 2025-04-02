'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import QuizPlayerDemo from '@/components/QuizPlayerDemo';
import MockExamPlayer from '@/components/MockExamPlayer';
import { useQuizSession } from '@/components/contexts/QuizSessionContext';

export default function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startQuizSession, completeQuizSession, currentSession } = useQuizSession();
  
  const quizType = searchParams.get('type');
  const selectedExam = searchParams.get('exam');

  useEffect(() => {
    if (!quizType || !selectedExam) {
      router.push('/dashboard');
      return;
    }
    
    const initSession = async () => {
      try {
        await startQuizSession(quizType, selectedExam);
      } catch (error) {
        console.error('Error starting session:', error);
        router.push('/dashboard');
      }
    };
    
    if (!currentSession) {
      initSession();
    }
  }, [quizType, selectedExam, router, startQuizSession, currentSession]);

  const handleQuizExit = async (results) => {
    if (results?.completed) {
      try {
        const completedSession = await completeQuizSession(
          results.score,
          results.timeSpent,
          results.totalQuestions
        );
        
        router.push(`/score?type=${quizType}&exam=${selectedExam}&score=${results.score}&totalQuestions=${results.totalQuestions}&timeSpent=${results.timeSpent}&sessionId=${completedSession.id}`);
      } catch (error) {
        console.error('Error completing session:', error);
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  };

  if (!quizType || !selectedExam || !currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const QuizComponent = quizType === 'mock' ? MockExamPlayer : QuizPlayerDemo;

  return (
    <div className="fixed inset-0 w-full h-full">
      <QuizComponent
        onExit={handleQuizExit}
        quizType={quizType}
        selectedExam={selectedExam}
      />
    </div>
  );
} 