'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

export default function Flashcards({ cards, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState(null);
  
  // Validate cards prop on component mount
  useEffect(() => {
    console.log("Flashcards component received cards:", cards);
    
    if (!Array.isArray(cards)) {
      console.error("Cards prop is not an array:", cards);
      setError("Invalid cards data format");
      return;
    }
    
    if (cards.length === 0) {
      console.log("Empty cards array received");
      return;
    }
    
    // Check if we have the required properties
    const firstCard = cards[0];
    if (!firstCard.hasOwnProperty('question') || !firstCard.hasOwnProperty('answer')) {
      console.error("Cards are missing question or answer properties:", firstCard);
      setError("Cards data is missing required fields");
      return;
    }
    
    // Clear error if validation passes
    setError(null);
  }, [cards]);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      } else {
        console.warn("onComplete is not a function or not provided");
      }
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };
  
  // Handle error state
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="w-full p-6 text-center">
          <CardContent>
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button variant="outline" onClick={() => setError(null)}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Handle empty cards array
  if (!cards || cards.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="w-full p-6 text-center">
          <CardContent>
            <p className="text-slate-600">No flashcards available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Safe access to current card with error handling
  const currentCard = cards[currentIndex] || { question: 'Error loading card', answer: 'Please try again' };
  
  // Calculate progress percentage
  const progress = ((currentIndex + 1) / cards.length) * 100;
  
  // Main component rendering
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress bar */}
      <Progress value={progress} className="mb-8" />
      
      {/* Card container */}
      <div className="relative w-full mb-8">
        <div className="transition-all duration-300 ease-in-out">
          <Card
            className={`w-full min-h-[600px] cursor-pointer shadow-lg transition-all duration-300 ${
              isFlipped ? "bg-slate-50" : "bg-white"
            }`}
            onClick={handleFlip}
          >
            <CardContent className="flex items-center justify-center h-full p-12">
              <div className="text-center w-full">
                {!isFlipped ? (
                  <>
                    <h3 className="text-3xl font-semibold text-slate-800 leading-relaxed">
                      {currentCard.question}
                    </h3>
                    <div className="mt-6 text-slate-500 text-base font-medium">
                      Click to reveal answer
                    </div>
                  </>
                ) : (
                  <p className="text-2xl text-slate-700 leading-relaxed whitespace-pre-line">
                    {currentCard.answer}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="text-base font-medium text-slate-600">
          Card {currentIndex + 1} of {cards.length}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Previous</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleFlip}
          >
            <RotateCw className="h-5 w-5 mr-1" />
            <span>Flip</span>
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={handleNext}
          >
            <span className="mr-1">{currentIndex === cards.length - 1 ? 'Complete' : 'Next'}</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}