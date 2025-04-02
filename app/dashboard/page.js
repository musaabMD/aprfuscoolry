'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { TabsContent } from "@/components/ui/tabs";
import { BottomNav } from "@/components/BottomNav";
import Home from '@/components/tabs/Home';
import Learn from '@/components/tabs/Learn';
import Practice from '@/components/tabs/Practice';
import Mock from '@/components/tabs/Mock';
import Review from '@/components/tabs/Review';
import QuizPlayerDemo from '@/components/QuizPlayerDemo';

// Import the exams data
const exams = {
  'NREMT': {
    price: 49,
    subjects: [
      'Airway, Respiration & Ventilation',
      'Cardiology & Resuscitation',
      'Clinical Judgment',
      'EKG Monitoring',
      'EMS Operations',
      'Medical & Obstetrics/Gynecology',
      'Trauma',
      'EMS Operations'
    ],
    subjectDetails: {
      'Airway, Respiration & Ventilation': {
        description: 'Comprehensive understanding of airway management and ventilation techniques.',
        flashcards: [
          {
            question: 'What is the primary goal of airway management?',
            answer: 'Ensure adequate oxygenation and ventilation while preventing aspiration.'
          },
          {
            question: 'Describe the steps of bag-valve-mask ventilation.',
            answer: '1. Position patient 2. Open airway 3. Create seal 4. Squeeze bag 5. Observe chest rise 6. Ventilate at appropriate rate'
          }
        ]
      }
    }
  },
  'ABEM': {
    price: 49,
    subjects: [
      'Emergency Medicine Principles',
      'Acute Care',
      'Critical Care',
      'Pediatric Emergency',
      'Trauma Management',
      'Environmental Emergencies',
      'Toxicology'
    ],
    subjectDetails: {
      'Emergency Medicine Principles': {
        description: 'Core concepts of emergency medicine.',
        flashcards: []
      },
      'Acute Care': {
        description: 'Management of acute medical conditions.',
        flashcards: []
      },
      'Critical Care': {
        description: 'Critical care principles and procedures.',
        flashcards: []
      },
      'Pediatric Emergency': {
        description: 'Emergency care for pediatric patients.',
        flashcards: []
      },
      'Trauma Management': {
        description: 'Trauma assessment and treatment.',
        flashcards: []
      },
      'Environmental Emergencies': {
        description: 'Management of environmental emergencies.',
        flashcards: []
      },
      'Toxicology': {
        description: 'Toxicology principles and treatments.',
        flashcards: []
      }
    }
  }
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedExam, setSelectedExam] = useState('NREMT');
  const [showQuizPlayer, setShowQuizPlayer] = useState(false);
  const [quizType, setQuizType] = useState(null); // 'practice' or 'mock'
  
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const mockExamHistory = [
    { date: '2024-03-15', score: 85, comment: 'Pass', subjects: 'NREMT' },
    { date: '2024-02-20', score: 72, comment: 'Need Improvement', subjects: 'ABEM' }
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/signin');
        return;
      }
      setUser(user);
    };
    
    getUser();
  }, [router, supabase]);

  if (!user) return null;

  const handleStartQuiz = (type) => {
    setQuizType(type);
    setShowQuizPlayer(true);
  };

  if (showQuizPlayer) {
    return (
      <QuizPlayerDemo 
        onExit={() => setShowQuizPlayer(false)}
        quizType={quizType}
        selectedExam={selectedExam}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'ho1me':
        return <Home user={user} selectedExam={selectedExam} setSelectedExam={setSelectedExam} exams={exams} mockExamHistory={mockExamHistory} />;
      case 'learn':
        return <Learn selectedExam={selectedExam} exams={exams} />;
      case 'practice':
        return <Practice selectedExam={selectedExam} exams={exams} onStartPractice={() => handleStartQuiz('practice')} />;
      case 'mock':
        return <Mock mockExamHistory={mockExamHistory} onStartMock={() => handleStartQuiz('mock')} />;
      case 'review':
        return <Review selectedExam={selectedExam} />;
      case 'profile':
        return <Profile user={user} supabase={supabase} router={router} />;
      default:
        return <Home user={user} selectedExam={selectedExam} setSelectedExam={setSelectedExam} exams={exams} mockExamHistory={mockExamHistory} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-auto pb-16">
        {renderContent()}
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
