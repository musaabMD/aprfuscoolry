// components/contexts/ExamContext.js
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useUser } from './UserContext';

const ExamContext = createContext();

export function ExamProvider({ children }) {
  const { user } = useUser();
  const [selectedExam, setSelectedExam] = useState(null);
  const [userExams, setUserExams] = useState({});
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Load user exams from Supabase
  const loadUserExams = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Get user's exam access
      const { data: accessData, error: accessError } = await supabase
        .from('user_exam_access')
        .select(`
          exam_id,
          access_type,
          exam:exams (
            id,
            name,
            description,
            slug,
            category_id,
            is_active,
            has_demo,
            subjects (
              id,
              name,
              description,
              flashcard_count,
              question_count
            )
          )
        `)
        .eq('user_id', user.id);

      if (accessError) throw accessError;

      // Transform the data into the required format
      const examsObj = {};
      for (const access of accessData) {
        if (access.exam) {
          const { exam } = access;
          examsObj[exam.name] = {
            id: exam.id,
            description: exam.description,
            slug: exam.slug,
            categoryId: exam.category_id,
            isActive: exam.is_active,
            hasDemo: exam.has_demo,
            subjects: exam.subjects || [],
            accessType: access.access_type
          };
        }
      }

      setUserExams(examsObj);

      // If there's a selected exam in localStorage, verify it exists in user's exams
      const storedExam = localStorage.getItem('selectedExam');
      if (storedExam && examsObj[storedExam]) {
        setSelectedExam(storedExam);
      } else {
        localStorage.removeItem('selectedExam');
        setSelectedExam(null);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
      setUserExams({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserExams();
  }, [user?.id]);

  // Select an exam
  const selectExam = (examName) => {
    if (examName && userExams[examName]) {
      setSelectedExam(examName);
      localStorage.setItem('selectedExam', examName);
    } else {
      setSelectedExam(null);
      localStorage.removeItem('selectedExam');
    }
  };

  // Add a new exam
  const addExam = async (newExam) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      // Call our API route to create the exam
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExam),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add exam');
      }

      const { exam } = await response.json();
      
      // Update local state
      setUserExams(prev => ({
        ...prev,
        [exam.name]: {
          id: exam.id,
          description: exam.description,
          slug: exam.slug,
          categoryId: exam.category_id,
          isActive: exam.is_active,
          hasDemo: exam.has_demo,
          subjects: newExam.categories?.map(category => ({
            name: category,
            description: `${category} for ${newExam.name}`,
            flashcard_count: 0,
            question_count: 0
          })) || [],
          accessType: newExam.purchaseType || 'free'
        }
      }));

      // Refresh user exams after adding a new one
      await loadUserExams();

      return exam;
    } catch (error) {
      console.error('Error adding exam:', error);
      throw error;
    }
  };

  const value = {
    selectedExam,
    selectExam,
    userExams,
    loading,
    addExam,
    refreshExams: loadUserExams
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
}