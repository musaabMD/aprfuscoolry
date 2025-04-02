'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ScoreMock from '@/components/ScoreMock';
import { useQuizSession } from '@/components/contexts/QuizSessionContext';

export default function MockScorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { validateScoreAccess } = useQuizSession();
  
  const score = parseInt(searchParams.get('score') || '0');
  const totalQuestions = parseInt(searchParams.get('totalQuestions') || '0');
  const timeSpent = searchParams.get('timeSpent') || '00:00:00';
  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    // Validate that this is a legitimate score access
    if (!validateScoreAccess('mock') || !sessionId) {
      router.replace('/dashboard');
      return;
    }
  }, [router, validateScoreAccess, sessionId]);

  if (!score || !totalQuestions || !sessionId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ScoreMock 
        score={score}
        timeSpent={timeSpent}
        totalQuestions={totalQuestions}
      />
    </div>
  );
} 