'use client';

import { useSearchParams } from 'next/navigation';
import ScorePractice from '@/components/ScorePractice';

export default function PracticeScorePage() {
  const searchParams = useSearchParams();
  
  const score = parseInt(searchParams.get('score') || '0');
  const totalQuestions = parseInt(searchParams.get('totalQuestions') || '0');
  const timeSpent = searchParams.get('timeSpent') || '00:00:00';

  return (
    <ScorePractice 
      score={score}
      totalQuestions={totalQuestions}
      timeSpent={timeSpent}
    />
  );
} 