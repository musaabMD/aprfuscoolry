'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import QuizPlayerDemo from '@/components/QuizPlayerDemo';
import { useQuizSession } from '@/components/contexts/QuizSessionContext';
import { toast } from 'react-hot-toast';

export default function PracticeSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startQuizSession, completeQuizSession, currentSession } = useQuizSession();
  const [questions, setQuestions] = useState(null);
  
  const selectedExam = searchParams.get('exam');
  const selectedSubjects = searchParams.get('subjects')?.split(',') || [];
  const questionCount = parseInt(searchParams.get('count') || '0');

  useEffect(() => {
    if (!selectedExam || selectedSubjects.length === 0) {
      router.push('/dashboard');
      return;
    }

    // Get questions from session storage
    const storedQuestions = sessionStorage.getItem('practiceQuestions');
    if (!storedQuestions) {
      toast.error('No questions found');
      router.push('/dashboard');
      return;
    }

    try {
      const parsedQuestions = JSON.parse(storedQuestions);
      setQuestions(parsedQuestions);

      // Initialize the quiz session
      if (!currentSession) {
        startQuizSession('practice', selectedExam);
      }
    } catch (error) {
      console.error('Error parsing questions:', error);
      toast.error('Error loading questions');
      router.push('/dashboard');
    }
  }, [selectedExam, selectedSubjects, currentSession, router, startQuizSession]);

  const handleQuizExit = async (results) => {
    if (results?.completed) {
      try {
        const completedSession = await completeQuizSession(
          results.score,
          results.timeSpent,
          results.totalQuestions
        );
        
        // Navigate to score page with session data
        router.push(`/score/practice?score=${results.score}&totalQuestions=${results.totalQuestions}&timeSpent=${results.timeSpent}&sessionId=${completedSession.id}`);
      } catch (error) {
        console.error('Error completing practice session:', error);
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  };

  // Show loading state while questions are being loaded
  if (!questions || !currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full">
      <QuizPlayerDemo
        onExit={handleQuizExit}
        quizType="practice"
        selectedExam={selectedExam}
        initialQuestions={questions}
      />
    </div>
  );
}