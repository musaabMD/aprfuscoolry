'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ScorePractice from '@/components/ScorePractice';
import { useQuizSession } from '@/components/contexts/QuizSessionContext';

export default function PracticeScorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { validateScoreAccess, sessionResults } = useQuizSession();
  
  useEffect(() => {
    // Verify this is a legitimate score page access
    const isValid = validateScoreAccess('practice');
    
    if (!isValid || !sessionResults) {
      router.replace('/dashboard');
      return;
    }
  }, [validateScoreAccess, router, sessionResults]);

  if (!sessionResults) return null;

  return (
    <ScorePractice 
      score={sessionResults.finalScore}
      totalQuestions={sessionResults.totalQuestions}
      timeSpent={sessionResults.timeSpent}
    />
  );
} 