'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Blueprint from '@/components/tabs/Blueprint';
import { useExam } from '@/components/contexts/ExamContext';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardContent } from "@/components/ui/card";

export default function Mock() {
  const router = useRouter();
  const { selectedExam, userExams } = useExam();
  const [mockExamHistory, setMockExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load mock exam history from Supabase
  useEffect(() => {
    if (!selectedExam || !userExams[selectedExam]) return;

    const fetchMockHistory = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('completed_sessions')
            .select(`
              id,
              score,
              total_questions,
              time_spent,
              completed_at,
              feedback,
              subjects:session_subjects(subject_id)
            `)
            .eq('user_id', user.id)
            .eq('exam_id', userExams[selectedExam].id)
            .eq('session_type', 'mock')
            .order('completed_at', { ascending: false })
            .limit(10);

          if (error) throw error;

          if (data) {
            const formattedHistory = data.map(session => ({
              id: session.id,
              score: session.score,
              totalQuestions: session.total_questions,
              timeSpent: session.time_spent,
              date: new Date(session.completed_at).toLocaleDateString(),
              feedback: session.feedback,
              subjects: session.subjects?.map(s => s.subject_id) || [],
              comment: session.score >= 70 ? 'Pass' : 'Review'
            }));

            setMockExamHistory(formattedHistory);
          }
        }
      } catch (error) {
        console.error('Error fetching mock history:', error);
        toast.error('Failed to load mock exam history');
      } finally {
        setLoading(false);
      }
    };

    fetchMockHistory();
  }, [selectedExam, userExams]);
  
  const handleStartMock = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }

    if (!userExams[selectedExam]?.id) {
      toast.error('Please select a valid exam');
      return;
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // Get user's access type
      const { data: accessData } = await supabase
        .from('user_exam_access')
        .select('access_type')
        .eq('user_id', user.id)
        .eq('exam_id', userExams[selectedExam].id)
        .single();

      // Get all subjects for the exam
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, question_count')
        .eq('exam_id', userExams[selectedExam].id);

      // Calculate total questions needed based on blueprint percentages
      const totalQuestions = accessData.access_type === 'free' ? 10 : 50;
      const subjectQuestions = subjects.map(subject => ({
        subjectId: subject.id,
        count: Math.round((subject.question_count / subjects.reduce((sum, s) => sum + s.question_count, 0)) * totalQuestions)
      }));

      // Get questions for each subject based on calculated counts
      const questionsPromises = subjectQuestions.map(({ subjectId, count }) => 
        supabase
          .from('questions')
          .select('id, question_text, options, correct_answer, explanation, subject_id')
          .eq('exam_id', userExams[selectedExam].id)
          .eq('subject_id', subjectId)
          .limit(count)
          .order('RANDOM()')
      );

      const questionsResults = await Promise.all(questionsPromises);
      const allQuestions = questionsResults.reduce((acc, result) => {
        if (result.error) {
          console.error('Error fetching questions:', result.error);
          return acc;
        }
        return [...acc, ...result.data];
      }, []);

      if (allQuestions.length === 0) {
        toast.error('No questions available for mock exam');
        return;
      }

      // Shuffle questions
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

      // Store questions in session storage for the mock exam
      sessionStorage.setItem('mockQuestions', JSON.stringify(shuffledQuestions));

      // Navigate to mock session
      router.push(`/mocksession?exam=${selectedExam}`);
    } catch (error) {
      console.error('Error starting mock exam:', error);
      toast.error('Failed to start mock exam');
    }
  };

  if (!selectedExam || !userExams[selectedExam]) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">No Exam Selected</h2>
            <p className="text-gray-600">Please select an exam from the dropdown menu above to view mock exam options.</p>
            {Object.keys(userExams).length === 0 && (
              <div className="mt-4">
                <p className="text-gray-600">You haven't added any exams yet.</p>
                <p className="text-sm text-gray-500 mt-2">Add an exam to start practicing!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <Card className="p-6">
          <CardContent className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </CardContent>
        </Card>
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