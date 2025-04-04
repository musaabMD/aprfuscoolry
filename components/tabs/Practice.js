'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useExam } from '@/components/contexts/ExamContext';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Clock,
  Flag,
  XCircle,
  ListChecks,
  Eye,
  EyeOff,
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { useUser } from '@/components/contexts/UserContext';

export default function Practice() {
  const router = useRouter();
  const { selectedExam, userExams } = useExam();
  const { user } = useUser();
  const [questionCount, setQuestionCount] = useState(50);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  // Load subject progress from Supabase
  useEffect(() => {
    if (!selectedExam || !userExams[selectedExam]) return;
    
    const fetchProgress = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user's progress for each subject
          const { data: progress } = await supabase
            .from('user_progress')
            .select(`
              subject_id,
              correct_count,
              total_attempts,
              last_attempt_at
            `)
            .eq('user_id', user.id)
            .eq('exam_id', userExams[selectedExam].id);
            
          if (progress) {
            const formattedProgress = progress.reduce((acc, item) => {
              acc[item.subject_id] = {
                correct: item.correct_count,
                total: item.total_attempts,
                score: Math.round((item.correct_count / item.total_attempts) * 100) || 0,
                lastAttempt: item.last_attempt_at
              };
              return acc;
            }, {});
            
            setProgressData(formattedProgress);
          }
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
        toast.error('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgress();
  }, [selectedExam, userExams]);

  // Calculate max questions available based on selected subjects
  const maxAvailableQuestions = useMemo(() => {
    if (!userExams[selectedExam]) return 0;
    
    return selectedSubjects.reduce((total, subjectId) => {
      const subject = userExams[selectedExam].subjects.find(s => s.id === subjectId);
      return total + (subject?.question_count || 0);
    }, 0);
  }, [selectedSubjects, selectedExam, userExams]);

  const handleStartPractice = async () => {
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject');
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

      // Get questions for selected subjects
      const { data: questions, error } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          options,
          correct_answer,
          explanation,
          subject_id
        `)
        .eq('exam_id', userExams[selectedExam].id)
        .in('subject_id', selectedSubjects)
        .limit(accessData.access_type === 'free' ? Math.min(questionCount, 10) : questionCount);

      if (error) {
        console.error('Error fetching questions:', error);
        toast.error('Failed to load questions');
        return;
      }

      if (!questions || questions.length === 0) {
        toast.error('No questions available for selected subjects');
        return;
      }

      // Store questions in session storage for the practice session
      sessionStorage.setItem('practiceQuestions', JSON.stringify(questions));
      
      // Navigate to practice session
      router.push(
        `/practicesession?exam=${selectedExam}&subjects=${selectedSubjects.join(',')}&count=${questions.length}`
      );
    } catch (error) {
      console.error('Error starting practice:', error);
      toast.error('Failed to start practice session');
    }
  };

  const getProgressBarColor = (score) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreBadge = (score) => {
    if (score >= 85) return { text: 'Mastered', color: 'text-green-700 bg-green-100' };
    if (score >= 70) return { text: 'Proficient', color: 'text-yellow-700 bg-yellow-100' };
    return { text: 'Needs Review', color: 'text-red-700 bg-red-100' };
  };

  if (!selectedExam || !userExams[selectedExam]) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">No Exam Selected</h2>
            <p className="text-gray-600">Please select an exam from the dropdown menu above to start practicing.</p>
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
          <h1 className="text-3xl font-bold mb-2">Practice Session</h1>
          <p className="text-gray-600">Select subjects to practice and customize your session</p>
        </div>

        {/* Subject Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Select Subjects</h2>
          <div className="space-y-4">
            {userExams[selectedExam].subjects.map((subject) => {
              const progress = progressData[subject.id] || { score: 0, total: 0 };
              const badge = getScoreBadge(progress.score);
              
              return (
                <div key={subject.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedSubjects.includes(subject.id)}
                      onCheckedChange={(checked) => {
                        setSelectedSubjects(
                          checked
                            ? [...selectedSubjects, subject.id]
                            : selectedSubjects.filter(id => id !== subject.id)
                        );
                      }}
                    />
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <div className="flex items-center mt-1">
                        <Progress
                          value={progress.score}
                          className="w-32 h-2 mr-3"
                          indicatorClassName={getProgressBarColor(progress.score)}
                        />
                        <span className={`text-xs px-2 py-1 rounded-full ${badge.color}`}>
                          {badge.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{progress.total} attempts</p>
                    <p>{progress.correct || 0} correct</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Session Configuration */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Session Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions
              </label>
              <input
                type="range"
                min="10"
                max={maxAvailableQuestions || 100}
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>10</span>
                <span>{questionCount} questions</span>
                <span>{maxAvailableQuestions || 100}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Start Button */}
        <Button
          onClick={handleStartPractice}
          disabled={selectedSubjects.length === 0}
          className="w-full py-6 text-lg"
        >
          Start Practice Session
        </Button>
      </div>
    </div>
  );
}