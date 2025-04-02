'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Flashcards from "@/components/Flashcards";
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useExam } from '@/components/contexts/ExamContext';
import { createBrowserClient } from '@supabase/ssr';

export default function Learn() {
  const { selectedExam, userExams } = useExam();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedSubject) return;

    // First check localStorage for cached flashcards
    const cachedCards = localStorage.getItem(`flashcards_${selectedExam}_${selectedSubject}`);
    if (cachedCards) {
      setFlashcards(JSON.parse(cachedCards));
      return;
    }

    // Then fetch from Supabase if not cached
    const fetchFlashcards = async () => {
      setLoading(true);
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data } = await supabase
          .from('flashcards')
          .select('*')
          .eq('exam_id', userExams[selectedExam]?.id)
          .eq('subject_id', selectedSubject)
          .order('created_at', { ascending: true })
          .limit(50); // Load in chunks for better performance

        if (data) {
          setFlashcards(data);
          // Cache for faster access next time
          localStorage.setItem(
            `flashcards_${selectedExam}_${selectedSubject}`,
            JSON.stringify(data)
          );
        }
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [selectedExam, selectedSubject, userExams]);

  const handleSubjectSelect = (subject) => {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-gray-500">
          <p>Please select an exam to start learning</p>
        </div>
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
                    {subject.flashcardCount || 0} flashcards
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
            
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
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