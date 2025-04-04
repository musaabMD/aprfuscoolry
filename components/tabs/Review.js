'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewMCQ from '../ReviewMCQ';
import { CheckCircle, XCircle, Flag, Layout } from 'lucide-react';
import { useExam } from '@/components/contexts/ExamContext';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'react-hot-toast';

export default function Review() {
  const { selectedExam, userExams } = useExam();
  const [reviewData, setReviewData] = useState({
    flagged: [],
    incorrect: [],
    correct: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedExam || !userExams[selectedExam]) return;

    const fetchReviewData = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          toast.error('Please sign in to view your review materials');
          return;
        }

        // Get user's answers and bookmarks
        const [answersResponse, bookmarksResponse] = await Promise.all([
          supabase
            .from('user_answers')
            .select(`
              question_id,
              selected_answer,
              is_correct,
              questions (
                id,
                question_text,
                correct_answer,
                explanation,
                options
              )
            `)
            .eq('user_id', user.id)
            .eq('exam_id', userExams[selectedExam].id)
            .limit(100),

          supabase
            .from('bookmarks')
            .select(`
              question_id,
              questions (
                id,
                question_text,
                correct_answer,
                explanation,
                options
              )
            `)
            .eq('user_id', user.id)
            .eq('exam_id', userExams[selectedExam].id)
        ]);

        const answers = answersResponse.data || [];
        const bookmarks = bookmarksResponse.data || [];

        // Process answers into correct and incorrect
        const correct = [];
        const incorrect = [];
        const flagged = bookmarks.map(bookmark => ({
          id: bookmark.questions.id,
          question: bookmark.questions.question_text,
          options: bookmark.questions.options,
          correctAnswer: bookmark.questions.correct_answer,
          selectedAnswer: answers.find(a => a.question_id === bookmark.question_id)?.selected_answer,
          explanation: bookmark.questions.explanation
        }));

        answers.forEach(answer => {
          if (!answer.questions) return;

          const questionData = {
            id: answer.questions.id,
            question: answer.questions.question_text,
            options: answer.questions.options,
            correctAnswer: answer.questions.correct_answer,
            selectedAnswer: answer.selected_answer,
            explanation: answer.questions.explanation
          };

          if (answer.is_correct) {
            correct.push(questionData);
          } else {
            incorrect.push(questionData);
          }
        });

        setReviewData({
          flagged,
          correct,
          incorrect
        });
      } catch (error) {
        console.error('Error fetching review data:', error);
        toast.error('Failed to load review materials');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [selectedExam, userExams]);

  const getAllQuestions = () => {
    return [
      ...reviewData.correct,
      ...reviewData.incorrect,
      ...reviewData.flagged
    ];
  };

  const filterQuestions = (questions) => {
    if (!searchQuery) return questions;
    return questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const renderQuestions = (questions) => {
    const filteredQuestions = filterQuestions(questions);
    return filteredQuestions.length > 0 ? (
      filteredQuestions.map((q) => (
        <ReviewMCQ key={q.id} question={q} />
      ))
    ) : (
      <div className="text-center py-8 text-gray-500">
        No questions found matching your search.
      </div>
    );
  };

  if (!selectedExam || !userExams[selectedExam]) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold mb-2">No Exam Selected</h2>
          <p className="text-gray-600">Please select an exam from the dropdown menu above to view review materials.</p>
          {Object.keys(userExams).length === 0 && (
            <div className="mt-4">
              <p className="text-gray-600">You haven't added any exams yet.</p>
              <p className="text-sm text-gray-500 mt-2">Add an exam to start reviewing!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <br />
      <br />
      <h1 className="text-3xl font-bold mb-8 text-center">
        Exam Review
      </h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search questions..."
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            <span className="hidden sm:inline">All ({filterQuestions(getAllQuestions()).length})</span>
          </TabsTrigger>
          <TabsTrigger value="correct" className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="hidden sm:inline">Correct ({filterQuestions(reviewData.correct).length})</span>
          </TabsTrigger>
          <TabsTrigger value="incorrect" className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="hidden sm:inline">Incorrect ({filterQuestions(reviewData.incorrect).length})</span>
          </TabsTrigger>
          <TabsTrigger value="flagged" className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-yellow-600" />
            <span className="hidden sm:inline">Flagged ({filterQuestions(reviewData.flagged).length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderQuestions(getAllQuestions())}
        </TabsContent>
        <TabsContent value="correct">
          {renderQuestions(reviewData.correct)}
        </TabsContent>
        <TabsContent value="incorrect">
          {renderQuestions(reviewData.incorrect)}
        </TabsContent>
        <TabsContent value="flagged">
          {renderQuestions(reviewData.flagged)}
        </TabsContent>
      </Tabs>
    </div>
  );
}