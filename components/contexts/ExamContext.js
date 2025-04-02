'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const ExamContext = createContext();

export function ExamProvider({ children }) {
  const [selectedExam, setSelectedExam] = useState(null);
  const [examData, setExamData] = useState(null);
  const [userExams, setUserExams] = useState({});
  const [loading, setLoading] = useState(true);

  // Load from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedExam = localStorage.getItem('selectedExam');
      const storedExamData = localStorage.getItem('examData');
      const storedUserExams = localStorage.getItem('userExams');
      
      if (storedExam) setSelectedExam(storedExam);
      if (storedExamData) {
        try {
          setExamData(JSON.parse(storedExamData));
        } catch (e) {
          console.error('Error parsing stored exam data:', e);
        }
      }
      if (storedUserExams) {
        try {
          setUserExams(JSON.parse(storedUserExams));
        } catch (e) {
          console.error('Error parsing stored user exams:', e);
        }
      }
    }
  }, []);

  // Load user exams from Supabase
  useEffect(() => {
    const loadUserExams = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user's exams from Supabase
          const { data } = await supabase
            .from('user_exam_access')
            .select(`
              exam_id,
              exams (
                id,
                name,
                description,
                question_count,
                subjects,
                created_at
              )
            `)
            .eq('user_id', user.id);
            
          if (data) {
            const examsObj = data.reduce((acc, item) => {
              const exam = item.exams;
              acc[exam.name] = {
                id: exam.id,
                description: exam.description,
                questionCount: exam.question_count,
                subjects: exam.subjects || [],
                createdAt: exam.created_at
              };
              return acc;
            }, {});
            
            setUserExams(examsObj);
            localStorage.setItem('userExams', JSON.stringify(examsObj));
            
            // Set first exam as selected if none selected
            if (!selectedExam && Object.keys(examsObj).length > 0) {
              const firstExam = Object.keys(examsObj)[0];
              selectExam(firstExam, examsObj[firstExam]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading exams:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserExams();
  }, [selectedExam]);

  const selectExam = (examId, data = null) => {
    setSelectedExam(examId);
    if (data) {
      setExamData(data);
      localStorage.setItem('examData', JSON.stringify(data));
    }
    localStorage.setItem('selectedExam', examId);
  };
  
  const addExam = async (examData) => {
    try {
      // Update local state first for responsive UI
      const updatedExams = {
        ...userExams,
        [examData.name]: {
          id: examData.id || examData.name.toLowerCase().replace(/\s+/g, '-'),
          description: examData.description,
          questionCount: examData.questions || 0,
          subjects: examData.categories || [],
          createdAt: new Date().toISOString()
        }
      };
      
      setUserExams(updatedExams);
      localStorage.setItem('userExams', JSON.stringify(updatedExams));
      selectExam(examData.name, updatedExams[examData.name]);
      
      // Then sync to Supabase
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Only if it's a user-created exam
        if (examData.purchaseType === 'free') {
          await supabase.from('user_created_exams').insert({
            user_id: user.id,
            name: examData.name,
            description: examData.description,
            subjects: examData.categories || [],
            question_count: examData.questions || 0
          });
        }
      }
    } catch (error) {
      console.error('Error adding exam:', error);
    }
  };
  
  const clearSelectedExam = () => {
    setSelectedExam(null);
    setExamData(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedExam');
      localStorage.removeItem('examData');
    }
  };
  
  return (
    <ExamContext.Provider value={{ 
      selectedExam, 
      examData,
      userExams,
      loading,
      selectExam,
      addExam,
      clearSelectedExam
    }}>
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