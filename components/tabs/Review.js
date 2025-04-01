'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewMCQ from '../ReviewMCQ';
import { CheckCircle, XCircle, Flag, Layout } from 'lucide-react';

export default function Review({ selectedExam }) {
  // Update the dummy questions with more detailed examples
  const dummyQuestions = {
    flagged: [
      {
        id: 'f1',
        question: 'What is the capital of France?',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        correctAnswer: 'Paris',
        selectedAnswer: 'London',
        explanation: 'Paris is the capital and largest city of France. It has been the capital since 987 CE.'
      },
      {
        id: 'f2',
        question: 'Which programming language is known as the "language of the web"?',
        options: ['Java', 'Python', 'JavaScript', 'C++'],
        correctAnswer: 'JavaScript',
        selectedAnswer: 'JavaScript',
        explanation: 'JavaScript is the primary language used for web development.'
      }
    ],
    incorrect: [
      {
        id: 'i1',
        question: 'Which of these is a JavaScript framework?',
        options: ['Django', 'React', 'Flask', 'Laravel'],
        correctAnswer: 'React',
        selectedAnswer: 'Django',
        explanation: 'React is a JavaScript framework developed by Facebook. Django is a Python framework.'
      },
      {
        id: 'i2',
        question: 'What is the largest planet in our solar system?',
        options: ['Mars', 'Saturn', 'Jupiter', 'Neptune'],
        correctAnswer: 'Jupiter',
        selectedAnswer: 'Saturn',
        explanation: 'Jupiter is the largest planet in our solar system, with a mass more than twice that of Saturn.'
      }
    ],
    correct: [
      {
        id: 'c1',
        question: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Hyper Transfer Markup Language',
          'Home Tool Markup Language'
        ],
        correctAnswer: 'Hyper Text Markup Language',
        selectedAnswer: 'Hyper Text Markup Language',
        explanation: 'HTML (Hyper Text Markup Language) is the standard markup language for creating web pages.'
      },
      {
        id: 'c2',
        question: 'Which year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correctAnswer: '1945',
        selectedAnswer: '1945',
        explanation: 'World War II ended in 1945 with the surrender of Germany in May and Japan in September.'
      }
    ]
  };

  const [reviewData, setReviewData] = useState(dummyQuestions);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
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
