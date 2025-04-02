'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Flashcards from "@/components/Flashcards";
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function Learn({ selectedExam, exams }) {
  const [selectedSubject, setSelectedSubject] = useState(null);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
  };

  const handleFlashcardsComplete = () => {
    // You can add functionality here for when all flashcards are completed
    setSelectedSubject(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <br />
      <br />
      {!selectedSubject ? (
        <div>
          <h1 className="text-3xl font-bold mb-6 text-slate-800">Study Materials</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams[selectedExam].subjects.map((subject) => (
              <Card 
                key={subject}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-blue-300"
                onClick={() => handleSubjectSelect(subject)}
              >
                <CardHeader className="bg-slate-50 pb-2">
                  <CardTitle className="text-xl text-slate-800">{subject}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-600 mb-3">
                    {exams[selectedExam].subjectDetails[subject]?.description || 'Detailed study materials coming soon.'}
                  </p>
                  <div className="flex items-center text-sm font-medium text-blue-600">
                    <BookOpen size={16} className="mr-1" />
                    {exams[selectedExam].subjectDetails[subject]?.flashcards 
                      ? `${exams[selectedExam].subjectDetails[subject].flashcards.length} flashcards` 
                      : 'No flashcards available'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <h1 className="text-3xl font-bold text-slate-800">{selectedSubject}</h1>
            </div>
          </div>
          
          {exams[selectedExam].subjectDetails[selectedSubject]?.flashcards ? (
            <Flashcards 
              cards={exams[selectedExam].subjectDetails[selectedSubject].flashcards}
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
  );
}