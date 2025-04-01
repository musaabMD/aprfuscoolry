'use client';

import { useSearchParams } from 'next/navigation';
import ScoreMock from '@/components/ScoreMock';

export default function MockScorePage() {
  const searchParams = useSearchParams();
  
  const score = parseInt(searchParams.get('score') || '0');
  const totalQuestions = parseInt(searchParams.get('totalQuestions') || '0');
  const timeSpent = searchParams.get('timeSpent') || '00:00:00';

  return (
    <ScoreMock 
      score={score}
      totalQuestions={totalQuestions}
      timeSpent={timeSpent}
    />
  );
} 