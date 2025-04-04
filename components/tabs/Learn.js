'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Flashcards from "@/components/Flashcards";
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useExam } from '@/components/contexts/ExamContext';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'react-hot-toast';

export default function Learn() {
  const { selectedExam, userExams } = useExam();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedSubject || !selectedExam || !userExams[selectedExam]) return;

    const fetchFlashcards = async () => {
      setLoading(true);
      setError(null);
      
      console.log("Fetching flashcards for:", {
        examId: userExams[selectedExam].id,
        subjectId: selectedSubject
      });

      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        // Get user's access level
        const userResponse = await supabase.auth.getUser();
        console.log("User response:", userResponse);
        
        if (!userResponse.data.user) {
          toast.error('Please sign in to access study materials');
          setError('Not authenticated');
          return;
        }

        // Get user's access type for this exam
        const accessResponse = await supabase
          .from('user_exam_access')
          .select('access_type')
          .eq('user_id', userResponse.data.user.id)
          .eq('exam_id', userExams[selectedExam].id)
          .single();
        
        console.log("Access response:", accessResponse);
        
        if (accessResponse.error) {
          console.error('Access error:', accessResponse.error);
          toast.error(`Error checking exam access: ${accessResponse.error.message}`);
          setError('Access error');
          return;
        }

        if (!accessResponse.data) {
          toast.error('You do not have access to this exam');
          setError('No access');
          return;
        }

        // Using a more direct approach - REMOVED created_at
        console.log("Running flashcard query with params:", {
          examId: userExams[selectedExam].id,
          subjectId: selectedSubject,
          limit: accessResponse.data.access_type === 'free' ? 10 : null
        });
        
        const queryResponse = await supabase
          .from('questions')
          .select('id, question_text, concept_front, concept_back, times_answered, times_correct')
          .eq('exam_id', userExams[selectedExam].id)
          .eq('subject_id', selectedSubject)
          .not('concept_front', 'is', null)
          .not('concept_back', 'is', null)
          .limit(accessResponse.data.access_type === 'free' ? 10 : 100);
        
        console.log("Flashcard query response:", queryResponse);

        if (queryResponse.error) {
          console.error('Query error:', queryResponse.error);
          // Show complete error details
          const errorDetails = JSON.stringify(queryResponse.error, null, 2);
          console.error('Complete error details:', errorDetails);
          toast.error(`Failed to load flashcards: ${queryResponse.error.message}`);
          setError('Query error');
          return;
        }

        // Handle the response data
        if (queryResponse.data && queryResponse.data.length > 0) {
          console.log(`Found ${queryResponse.data.length} flashcards`);
          
          // Transform the data for the Flashcards component
          const formattedFlashcards = queryResponse.data.map(card => ({
            id: card.id,
            question: card.concept_front || '',
            answer: card.concept_back || '',
            timesAnswered: card.times_answered || 0,
            timesCorrect: card.times_correct || 0
          }));
          
          console.log("Formatted flashcards example:", 
            formattedFlashcards.length > 0 ? formattedFlashcards[0] : "No cards");
          
          setFlashcards(formattedFlashcards);
        } else {
          console.log("No flashcards found");
          setFlashcards([]);
        }
      } catch (error) {
        console.error('Unexpected error fetching flashcards:', error);
        toast.error(`Failed to load study materials: ${error.message || 'Unknown error'}`);
        setError('Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [selectedExam, selectedSubject, userExams]);

  const handleSubjectSelect = (subject) => {
    console.log("Subject selected:", subject);
    setSelectedSubject(subject);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setFlashcards([]);
  };

  const handleFlashcardsComplete = () => {
    setSelectedSubject(null);
    setFlashcards([]);
  };

  if (!selectedExam || !userExams[selectedExam]) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">No Exam Selected</h2>
            <p className="text-gray-600">Please select an exam from the dropdown menu above to view study materials.</p>
            {Object.keys(userExams).length === 0 && (
              <div className="mt-4">
                <p className="text-gray-600">You haven't added any exams yet.</p>
                <p className="text-sm text-gray-500 mt-2">Add an exam to start studying!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && selectedSubject) {
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
      <div>
        <h1 className="text-3xl font-bold mb-6 text-slate-800">Study Materials</h1>
        
        {!selectedSubject ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userExams[selectedExam].subjects.map((subject) => (
              <Card 
                key={subject.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-blue-300"
                onClick={() => handleSubjectSelect(subject.id)}
              >
                <CardHeader className="bg-slate-50 pb-2">
                  <CardTitle className="text-xl text-slate-800">{subject.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-600 mb-3">
                    {subject.description || 'Study materials and flashcards for this subject.'}
                  </p>
                  <div className="flex items-center text-sm font-medium text-blue-600">
                    <BookOpen size={16} className="mr-1" />
                    {subject.flashcard_count || 0} flashcards available
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-8 flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToSubjects}
                  className="text-slate-600 hover:text-slate-800"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Back
                </Button>
                <h1 className="text-3xl font-bold text-slate-800">
                  {userExams[selectedExam].subjects.find(s => s.id === selectedSubject)?.name}
                </h1>
              </div>
            </div>
            
            {error ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-red-600">Error loading flashcards: {error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                      fetchFlashcards();
                    }}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : flashcards.length > 0 ? (
              <Flashcards 
                cards={flashcards}
                onComplete={handleFlashcardsComplete}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-slate-600">No flashcards available for this subject yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}