'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ExamContext = createContext();

export function ExamProvider({ children }) {
  const [selectedExam, setSelectedExam] = useState(null);
  const [examData, setExamData] = useState(null);
  
  // Load from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedExam = localStorage.getItem('selectedExam');
      const storedExamData = localStorage.getItem('examData');
      
      if (storedExam) {
        setSelectedExam(storedExam);
      }
      
      if (storedExamData) {
        try {
          setExamData(JSON.parse(storedExamData));
        } catch (e) {
          console.error('Error parsing stored exam data:', e);
        }
      }
    }
  }, []);
  
  // Save to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedExam) {
      localStorage.setItem('selectedExam', selectedExam);
    }
  }, [selectedExam]);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && examData) {
      localStorage.setItem('examData', JSON.stringify(examData));
    }
  }, [examData]);
  
  const selectExam = (examId, data = null) => {
    setSelectedExam(examId);
    if (data) {
      setExamData(data);
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
      selectExam,
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