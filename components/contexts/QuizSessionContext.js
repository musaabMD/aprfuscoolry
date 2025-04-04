// components/contexts/QuizSessionContext.js
// This needs to be placed in your project's components/contexts directory
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const QuizSessionContext = createContext();

export function QuizSessionProvider({ children }) {
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionResults, setSessionResults] = useState(null);
  const router = useRouter();
  
  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('currentQuizSession');
    if (savedSession) {
      try {
        setCurrentSession(JSON.parse(savedSession));
      } catch (e) {
        console.error('Error parsing saved session:', e);
      }
    }
  }, []);
  
  const startQuizSession = async (quizType, examId) => {
    const session = {
      id: Date.now().toString(),
      quizType,
      examId,
      startTime: new Date().toISOString(),
      answers: [],
      completed: false
    };
    
    setCurrentSession(session);
    localStorage.setItem('currentQuizSession', JSON.stringify(session));
    return session;
  };
  
  const saveAnswer = (questionId, selectedAnswer, isCorrect, timeSpent) => {
    if (!currentSession) return;

    const answer = {
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpent,
      timestamp: new Date().toISOString()
    };

    // Update in memory
    const updatedSession = {
      ...currentSession,
      answers: [...currentSession.answers, answer]
    };
    setCurrentSession(updatedSession);

    // Batch save to localStorage
    localStorage.setItem('currentQuizSession', JSON.stringify(updatedSession));
  };
  
  const completeQuizSession = async (finalScore, timeSpent, totalQuestions) => {
    if (!currentSession) return null;

    const completedSession = {
      ...currentSession,
      completed: true,
      endTime: new Date().toISOString(),
      finalScore,
      timeSpent,
      totalQuestions
    };

    try {
      // Only sync completed sessions to Supabase
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save score summary to Supabase
        await supabase.from('completed_sessions').insert({
          user_id: user.id,
          exam_id: currentSession.examId,
          session_type: currentSession.quizType,
          score: finalScore,
          total_questions: totalQuestions,
          time_spent: timeSpent,
          completed_at: new Date().toISOString()
        });
        
        // Update user progress stats
        const correctAnswers = currentSession.answers.filter(a => a.isCorrect).length;
        await supabase.rpc('update_user_progress', {
          p_user_id: user.id,
          p_exam_id: currentSession.examId,
          p_correct_count: correctAnswers,
          p_total_questions: totalQuestions
        });
      }
    } catch (error) {
      console.error('Error saving session to Supabase:', error);
    }

    // Save final results locally
    setSessionResults(completedSession);
    localStorage.setItem('lastQuizResults', JSON.stringify(completedSession));
    
    // Clear current session
    setCurrentSession(null);
    localStorage.removeItem('currentQuizSession');

    return completedSession;
  };
  
  // Function to validate if score page access is legitimate
  const validateScoreAccess = (quizType) => {
    const lastResults = localStorage.getItem('lastQuizResults');
    if (!lastResults) return false;

    try {
      const results = JSON.parse(lastResults);
      return (
        results.completed &&
        results.quizType === quizType &&
        Date.now() - new Date(results.endTime).getTime() < 5 * 60 * 1000 // Only valid for 5 minutes
      );
    } catch (e) {
      return false;
    }
  };
  
  return (
    <QuizSessionContext.Provider value={{
      currentSession,
      sessionResults,
      startQuizSession,
      saveAnswer,
      completeQuizSession,
      validateScoreAccess
    }}>
      {children}
    </QuizSessionContext.Provider>
  );
}

export const useQuizSession = () => useContext(QuizSessionContext);