'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Home from "@/components/tabs/Home";

// Mock data for the landing page
const exams = {
  'NREMT': {
    price: 49,
    subjects: ['Airway', 'Cardiology', 'Medical', 'Trauma']
  },
  'ABEM': {
    price: 49,
    subjects: ['Emergency', 'Critical Care', 'Pediatric']
  }
};

const mockExamHistory = [
  { subjects: 'Cardiology Quiz', date: 'Today', score: 85, comment: 'Pass' },
  { subjects: 'Trauma Practice', date: 'Yesterday', score: 75, comment: 'Review' },
  { subjects: 'Medical Assessment', date: '2 days ago', score: 90, comment: 'Pass' },
];

export default function Page() {
  const router = useRouter();
  const [selectedExam, setSelectedExam] = useState('NREMT');
  const [user, setUser] = useState(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        router.push('/dashboard');
      }
    };
    
    checkUser();
  }, [router, supabase]);

  return (
    <div className="pt-16">
      <Home 
        user={user}
        selectedExam={selectedExam}
        setSelectedExam={setSelectedExam}
        exams={exams}
        mockExamHistory={mockExamHistory}
      />
    </div>
  );
}
