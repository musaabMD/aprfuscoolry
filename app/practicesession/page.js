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
  
  // Get quiz type and exam from URL params
  const quizType = searchParams.get('type'); // 'mock' or 'practice'
  const selectedExam = searchParams.get('exam');

  useEffect(() => {
    if (!quizType || !selectedExam) {
      router.push('/dashboard');
      return;
    }
    
    // Initialize the quiz session
    const initSession = async () => {
      try {
        await startQuizSession(quizType, selectedExam);
      } catch (error) {
        console.error('Error starting quiz session:', error);
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
        // Complete the session in our context
        await completeQuizSession(
          results.score,
          results.timeSpent,
          results.totalQuestions
        );
        
        // Navigate to appropriate score page
        router.push(`/score/${quizType}`);
      } catch (error) {
        console.error('Error completing quiz:', error);
        router.push('/dashboard');
      }
    } else {
      // If quiz wasn't completed, go back to previous page
      router.back();
    }
  };

  // Don't render anything if we don't have the required params
  if (!quizType || !selectedExam) return null;

  // Don't render until we have a session
  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Choose which component to render based on quiz type
  const QuizComponent = quizType === 'mock' ? MockExamPlayer : QuizPlayerDemo;

  return (
    <div className="min-h-screen">
      <QuizComponent
        onExit={handleQuizExit}
        quizType={quizType}
        selectedExam={selectedExam}
      />
    </div>
  );
}