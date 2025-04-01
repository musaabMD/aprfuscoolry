'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const ReviewMCQ = ({ question }) => {
  const isCorrect = question.selectedAnswer === question.correctAnswer;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <h3 className="font-semibold mb-4 text-lg">{question.question}</h3>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-lg border ${
              question.selectedAnswer === option
                ? question.selectedAnswer === question.correctAnswer
                  ? 'bg-green-100 border-green-500'
                  : 'bg-red-100 border-red-500'
                : question.correctAnswer === option
                ? 'bg-green-100 border-green-500'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <p className="flex items-center">
              <span className="mr-3">{String.fromCharCode(65 + index)}.</span>
              {option}
            </p>
          </div>
        ))}
      </div>
      
      {question.explanation && (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg bg-indigo-50 border-2 border-indigo-200">
            <div className="space-y-4 mb-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/80">
                <span className="font-semibold text-gray-700 min-w-[120px]">Your Answer:</span>
                <span className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full ${
                    isCorrect 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'bg-orange-50 border-2 border-orange-200'
                  }`}>
                    {question.selectedAnswer}
                  </span>
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-orange-600" />
                  )}
                </span>
              </div>

              {!isCorrect && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/80">
                  <span className="font-semibold text-gray-700 min-w-[120px]">Correct Answer:</span>
                  <span className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-50 border-2 border-blue-200">
                      {question.correctAnswer}
                    </span>
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-indigo-200 pt-4">
              <p className="font-semibold text-gray-700 mb-2">Explanation:</p>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewMCQ;
