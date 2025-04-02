'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Blueprint from '@/components/tabs/Blueprint';
import { useExam } from '@/components/contexts/ExamContext';
import { createBrowserClient } from '@supabase/ssr';
import { Card } from "@/components/ui/card";

export default function Mock() {
  const router = useRouter();
  const { selectedExam } = useExam();
  const [mockExamHistory, setMockExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load mock exam history
  useEffect(() => {
    if (!selectedExam) return;

    // First check localStorage
    const cachedHistory = localStorage.getItem(`mockHistory_${selectedExam}`);
    if (cachedHistory) {
      setMockExamHistory(JSON.parse(cachedHistory));
      setLoading(false);
    }

    // Then fetch from Supabase
    const fetchMockHistory = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from('completed_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('exam_id', selectedExam)
            .eq('session_type', 'mock')
            .order('completed_at', { ascending: false })
            .limit(10);

          if (data) {
            const formattedHistory = data.map(session => ({
              id: session.id,
              score: session.score,
              totalQuestions: session.total_questions,
              timeSpent: session.time_spent,
              date: new Date(session.completed_at).toLocaleDateString(),
              comment: session.score >= 70 ? 'Pass' : 'Review'
            }));

            setMockExamHistory(formattedHistory);
            localStorage.setItem(`mockHistory_${selectedExam}`, JSON.stringify(formattedHistory));
          }
        }
      } catch (error) {
        console.error('Error fetching mock history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMockHistory();
  }, [selectedExam]);
  
  const handleStartMock = () => {
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }
    router.push(`/mocksession?exam=${selectedExam}`);
  };

  if (!selectedExam || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mock Exam</h1>
          <p className="text-gray-600">Take a full-length mock exam to test your knowledge</p>
        </div>

        {/* Blueprint Component */}
        <Blueprint selectedExam={selectedExam} />
        
        {/* Mock Exam History */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Mock Exam History</h2>
          {mockExamHistory.length > 0 ? (
            <div className="space-y-4">
              {mockExamHistory.map((exam) => (
                <div 
                  key={exam.id} 
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold">Mock Exam</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{exam.date}</span>
                      <span>•</span>
                      <span>{exam.timeSpent}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{exam.score}%</p>
                    <p className={`text-sm ${
                      exam.comment === 'Pass' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {exam.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No mock exam history yet.</p>
              <p className="text-sm">Take your first mock exam to see your results here.</p>
            </div>
          )}
        </Card>
        
        {/* Start Button */}
        <Button
          onClick={handleStartMock}
          className="w-full py-6 text-lg"
        >
          Start Mock Exam
        </Button>
      </div>
    </div>
  );
}