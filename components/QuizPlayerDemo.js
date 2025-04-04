import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Clock, PauseCircle, PlayCircle, Pin, Lightbulb, Flag, X, Info, Menu, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/contexts/UserContext';
import { useQuizSession } from '@/components/contexts/QuizSessionContext';
import { toast } from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';

const QuizPlayerDemo = ({ onExit, onComplete, quizType, selectedExam, initialQuestions }) => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { currentSession, saveAnswer } = useQuizSession();
  const [supabase, setSupabase] = useState(null);
  
  // Core state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(true);
  const [showModeInfo, setShowModeInfo] = useState(false);
  const [showExitInfo, setShowExitInfo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sessionId, setSessionId] = useState(null);
  
  // Timer related state
  const [showTimer, setShowTimer] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  
  // Initialize Supabase client
  useEffect(() => {
    const supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    setSupabase(supabaseClient);
    
    // Generate a unique session ID
    setSessionId(Date.now().toString());
  }, []);

  // Load existing bookmarks
  useEffect(() => {
    if (!supabase || !user || !questions.length) return;

    const loadBookmarks = async () => {
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('question_id')
        .eq('user_id', user.id)
        .in('question_id', questions.map(q => q.id));

      if (bookmarksData) {
        const bookmarksMap = {};
        bookmarksData.forEach(bookmark => {
          bookmarksMap[bookmark.question_id] = true;
        });
        setBookmarks(bookmarksMap);
      }
    };

    loadBookmarks();
  }, [supabase, user, questions]);
  
  // Load questions from session storage if not provided as prop
  useEffect(() => {
    if (initialQuestions) {
      const formattedQuestions = initialQuestions.map(q => ({
        ...q,
        options: [
          { id: 'a', text: q.option_a },
          { id: 'b', text: q.option_b },
          { id: 'c', text: q.option_c },
          { id: 'd', text: q.option_d },
          { id: 'e', text: q.option_e },
          { id: 'f', text: q.option_f }
        ].filter(opt => opt.text) // Remove empty options
      }));
      setQuestions(formattedQuestions);
    } else {
      const storedQuestions = sessionStorage.getItem(
        quizType === 'mock' ? 'mockQuestions' : 'practiceQuestions'
      );
      
      if (!storedQuestions) {
        toast.error('No questions found');
        router.push('/dashboard');
        return;
      }

      try {
        const parsedQuestions = JSON.parse(storedQuestions);
        const formattedQuestions = parsedQuestions.map(q => ({
          ...q,
          options: [
            { id: 'a', text: q.option_a },
            { id: 'b', text: q.option_b },
            { id: 'c', text: q.option_c },
            { id: 'd', text: q.option_d },
            { id: 'e', text: q.option_e },
            { id: 'f', text: q.option_f }
          ].filter(opt => opt.text)
        }));
        setQuestions(formattedQuestions);
      } catch (error) {
        console.error('Error parsing questions:', error);
        toast.error('Error loading questions');
        router.push('/dashboard');
      }
    }
  }, [initialQuestions, quizType, router]);
  
  const currentQuestion = questions[currentIndex];
  
  // Add examName based on selectedExam prop
  const examName = selectedExam || "Practice Session";
  
  // Close modals when clicking outside
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Left arrow key - previous question
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        goToPrevious();
      }
      // Right arrow key - next question
      else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        goToNext();
      }
      // B key - toggle bookmark
      else if (e.key === 'b' || e.key === 'B') {
        toggleBookmark();
      }
      // M key - toggle mode
      else if (e.key === 'm' || e.key === 'M') {
        toggleQuizMode();
      }
      // Escape key - close modals and sidebar
      else if (e.key === 'Escape') {
        setShowFeedback(false);
        setShowModeInfo(false);
        setShowExitInfo(false);
        setSidebarOpen(false);
      }
    };
    
    // Close modals when clicking outside
    const handleClickOutside = (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        setShowFeedback(false);
        setShowModeInfo(false);
        setShowExitInfo(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [currentIndex, questions.length]);
  
  // Timer effect
  useEffect(() => {
    let interval;
    
    if (showTimer && !isPaused) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [showTimer, isPaused]);
  
  // Format timer display
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Navigation handlers
  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  // Handle selecting an answer
  const handleAnswerClick = async (choiceId) => {
    if (!isQuizMode || !user || answers[currentQuestion.id]) return;

    const newAnswers = { ...answers };
    newAnswers[currentQuestion.id] = choiceId;
    setAnswers(newAnswers);

    const isCorrect = choiceId === currentQuestion.correct_answer;

    // Save answer in context
    saveAnswer(currentQuestion.id, choiceId, isCorrect, seconds);

    // Store answer in Supabase
    if (supabase) {
      try {
        await supabase.from('user_answers').insert({
          user_id: user.id,
          question_id: currentQuestion.id,
          selected_answer: choiceId,
          is_correct: isCorrect,
          session_id: sessionId,
          exam_id: selectedExam,
          time_spent: seconds
        });

        // Update user progress
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          exam_id: selectedExam,
          subject_id: currentQuestion.subject_id,
          correct_count: isCorrect ? 1 : 0,
          total_attempts: 1,
          last_attempt: new Date().toISOString()
        }, {
          onConflict: 'user_id,exam_id,subject_id',
          count: 'total_attempts',
          increment: ['correct_count', 'total_attempts']
        });

      } catch (error) {
        console.error('Error saving answer:', error);
        toast.error('Failed to save your answer');
      }
    }

    // Show explanation
    const newShowExplanation = { ...showExplanation };
    newShowExplanation[currentQuestion.id] = true;
    setShowExplanation(newShowExplanation);
  };
  
  // Toggle bookmark status
  const toggleBookmark = async () => {
    if (!user || !supabase) {
      toast.error('Please sign in to bookmark questions');
      return;
    }

    const newBookmarks = { ...bookmarks };
    const isBookmarked = !bookmarks[currentQuestion.id];
    newBookmarks[currentQuestion.id] = isBookmarked;
    setBookmarks(newBookmarks);

    try {
      if (isBookmarked) {
        await supabase.from('bookmarks').insert({
          user_id: user.id,
          question_id: currentQuestion.id,
          exam_id: selectedExam
        });
      } else {
        await supabase.from('bookmarks').delete()
          .match({ user_id: user.id, question_id: currentQuestion.id });
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error('Failed to update bookmark');
      // Revert the bookmark state on error
      newBookmarks[currentQuestion.id] = !isBookmarked;
      setBookmarks(newBookmarks);
    }
  };
  
  // Toggle quiz mode (hide/show answers)
  const toggleQuizMode = () => {
    setIsQuizMode(!isQuizMode);
  };
  
  // Show exit/resume dialog
  const handleExitResume = () => {
    setShowExitInfo(true);
  };
  
  const handleExit = async () => {
    const isComplete = Object.keys(answers).length === questions.length;
    
    if (isComplete && user && supabase) {
      // Calculate score
      const correctAnswers = Object.entries(answers).reduce((count, [questionId, answer]) => {
        return count + (answer === questions.find(q => q.id === questionId)?.correct_answer ? 1 : 0);
      }, 0);
      
      try {
        // Store session results
        const { data: sessionData } = await supabase.from('practice_sessions').insert({
          user_id: user.id,
          exam_id: selectedExam,
          session_id: sessionId,
          total_questions: questions.length,
          correct_answers: correctAnswers,
          time_spent: seconds,
          completed: true,
          session_type: quizType
        }).select().single();

        // Navigate to appropriate score page
        const scorePagePath = quizType === 'mock' ? '/score/mock' : '/score/practice';
        router.push(`${scorePagePath}?score=${correctAnswers}&totalQuestions=${questions.length}&timeSpent=${formatTime(seconds)}&sessionId=${sessionData.id}`);
      } catch (error) {
        console.error('Error saving session:', error);
        toast.error('Failed to save session results');
      }
    } else {
      router.push('/dashboard');
    }
  };
  
  // Navigate directly to a question
  const navigateToQuestion = (index) => {
    setCurrentIndex(index);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };
  
  // Filter questions based on active filter
  const filteredQuestions = () => {
    if (activeFilter === 'all') return questions;
    
    if (activeFilter === 'bookmarked') {
      return questions.filter(q => bookmarks[q.id]);
    }
    
    if (activeFilter === 'unanswered') {
      return questions.filter(q => !answers[q.id]);
    }
    
    return questions;
  };
  
  // Determine if answer is correct
  const isAnswerCorrect = (questionId, choiceId) => {
    const question = questions.find(q => q.id === questionId);
    return question && choiceId === question.correct_choice;
  };
  
  // Determine style for answer choices
  const getChoiceStyle = (choiceId) => {
    const baseStyle = 'w-full p-5 text-left border rounded-lg transition-all flex justify-between items-center text-lg';
    
    if (isQuizMode && !answers[currentQuestion.id]) {
      return `${baseStyle} bg-white border-stone-300 hover:bg-gray-100 hover:border-stone-400`;
    }
    
    // If we're in show mode or have answered in quiz mode
    if (!isQuizMode || answers[currentQuestion.id]) {
      if (choiceId === answers[currentQuestion.id]) {
        if (isAnswerCorrect(currentQuestion.id, choiceId)) {
          return `${baseStyle} bg-green-100 border-green-600 hover:bg-green-200 hover:border-green-700`;
        } else {
          return `${baseStyle} bg-red-100 border-red-600 hover:bg-red-200 hover:border-red-700`;
        }
      }
      
      if (choiceId === currentQuestion.correct_choice) {
        return `${baseStyle} bg-green-100 border-green-600 hover:bg-green-200 hover:border-green-700`;
      }
    }
    
    return `${baseStyle} bg-white border-stone-300 hover:bg-gray-100 hover:border-stone-400`;
  };
  
  // Render answer choices for current question
  const renderChoices = () => {
    if (!currentQuestion?.options) return null;

    return currentQuestion.options.map(option => (
      <button
        key={option.id}
        onClick={() => handleAnswerClick(option.id)}
        disabled={isQuizMode && answers[currentQuestion.id]}
        className={getChoiceStyle(option.id)}
      >
        <div className="flex items-center gap-4">
          <span className="font-medium text-xl text-stone-800 min-w-6 text-center">
            {option.id.toUpperCase()}
          </span>
          <span className="text-lg text-stone-800">{option.text}</span>
        </div>
      </button>
    ));
  };
  
  // Render sidebar
  const renderSidebar = () => {
    const filtered = filteredQuestions();
    
    return (
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-blue-700">{examName}</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`text-left px-3 py-2 rounded-md ${activeFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              All Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveFilter('bookmarked')}
              className={`text-left px-3 py-2 rounded-md ${activeFilter === 'bookmarked' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Bookmarked ({Object.values(bookmarks).filter(Boolean).length})
            </button>
            <button
              onClick={() => setActiveFilter('unanswered')}
              className={`text-left px-3 py-2 rounded-md ${activeFilter === 'unanswered' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Unanswered ({questions.length - Object.keys(answers).length})
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-180px)]">
          <div className="grid grid-cols-5 gap-2">
            {filtered.map((q, idx) => {
              const questionIndex = questions.findIndex(question => question.id === q.id);
              const isCurrentQuestion = currentIndex === questionIndex;
              const isAnswered = !!answers[q.id];
              const isBookmarked = !!bookmarks[q.id];
              
              let bgColor = 'bg-white border border-gray-300';
              
              if (isCurrentQuestion) {
                bgColor = 'bg-blue-500 text-white border border-blue-500';
              } else if (isAnswered) {
                bgColor = isAnswerCorrect(q.id, answers[q.id])
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300';
              }
              
              return (
                <button
                  key={q.id}
                  onClick={() => navigateToQuestion(questionIndex)}
                  className={`relative ${bgColor} rounded-md flex items-center justify-center h-10 hover:opacity-80 transition-opacity`}
                >
                  <span>{questionIndex + 1}</span>
                  {isBookmarked && (
                    <span className="absolute -top-1 -right-1">
                      <Pin size={10} className="text-blue-500 fill-blue-500" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  // Render modals
  const renderFeedback = () => {
    if (!showFeedback) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6 m-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Submit Feedback</h3>
            <button
              onClick={() => setShowFeedback(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="typo" className="h-4 w-4" />
              <label htmlFor="typo" className="text-sm">Typo</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="incorrect" className="h-4 w-4" />
              <label htmlFor="incorrect" className="text-sm">Question is incorrect</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="unclear" className="h-4 w-4" />
              <label htmlFor="unclear" className="text-sm">Question is unclear</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="other" className="h-4 w-4" />
              <label htmlFor="other" className="text-sm">Other issue</label>
            </div>
          </div>
          <textarea
            placeholder="Describe the issue..."
            className="w-full p-2 border rounded-md mt-4 min-h-24"
          />
          <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Submit Feedback
          </button>
        </div>
      </div>
    );
  };
  
  const renderModeInfo = () => {
    if (!showModeInfo) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6 m-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Study Modes</h3>
            <button
              onClick={() => setShowModeInfo(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <h4 className="font-medium mb-1">Quiz Mode</h4>
              <p className="text-sm">In Quiz Mode, you must select an answer to see if it's correct. Explanations will appear after answering.</p>
            </div>
            <div className="p-3 bg-green-50 rounded-md border border-green-200">
              <h4 className="font-medium mb-1">Study Mode</h4>
              <p className="text-sm">In Study Mode, correct answers and explanations are shown immediately. Use this to review material you've already studied.</p>
            </div>
          </div>
          <button
            onClick={() => setShowModeInfo(false)}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Got it
          </button>
        </div>
      </div>
    );
  };
  
  const renderExitInfo = () => {
    if (!showExitInfo) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6 m-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Exit & Resume</h3>
            <button
              onClick={() => setShowExitInfo(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mb-4">You're currently on Question {currentIndex + 1} of {questions.length}.</p>
          <p className="text-sm mb-4">
            If you exit now, your progress will be saved. You can resume this quiz later from this question.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowExitInfo(false)}
              className="flex-1 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleExit}
              className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // If loading, show loading state
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // If no user, redirect to signin (this is a backup to middleware)
  if (!user) {
    router.push('/signin');
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed header - More minimal for mobile */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-lg">
        <div className="h-12 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 hover:bg-blue-700 rounded-md"
            >
              <Menu size={18} />
            </button>
            <span className="text-sm font-medium">Scoorly</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs bg-blue-700 px-2 py-1 rounded-full">
              {currentIndex + 1}/{questions.length}
            </span>
            {showTimer && (
              <div className="flex items-center space-x-1 bg-blue-700 px-2 py-1 rounded-full">
                <Clock size={14} />
                <span className="font-mono text-xs">{formatTime(seconds)}</span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Adjust top padding to match new header height */}
      <div className="pt-12 flex flex-1">
        {/* Sidebar */}
        {renderSidebar()}
        
        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        {/* Main content - Adjust padding for mobile */}
        <div className="flex-1 p-4">
          <div className="max-w-3xl mx-auto">
            {/* Question - More compact for mobile */}
            <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
              <p className="text-base md:text-lg font-medium text-blue-900">
                {currentQuestion.question_text}
              </p>
            </div>
            
            {/* Answer Choices - More compact for mobile */}
            <div className="space-y-3 mb-6">
              {renderChoices()}
            </div>
            
            {/* Explanation - More compact for mobile */}
            {(!isQuizMode || showExplanation[currentQuestion.id]) && (
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50">
                <h3 className="font-medium text-amber-800 mb-2 text-sm flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                  Explanation
                </h3>
                <p className="text-stone-800 text-sm leading-relaxed">
                  {currentQuestion.rationale}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Fixed footer - More compact for mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-3 py-2 shadow-lg">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBookmark}
              className="p-1.5 rounded-full hover:bg-gray-100"
            >
              <Pin className={`w-4 h-4 ${bookmarks[currentQuestion.id] ? 'text-blue-500 fill-blue-500' : 'text-stone-500'}`} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className={`p-1.5 rounded-full ${currentIndex === 0 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-100'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex === questions.length - 1}
              className={`p-1.5 rounded-full ${currentIndex === questions.length - 1 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-100'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExitResume}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {renderFeedback()}
      {renderModeInfo()}
      {renderExitInfo()}
    </div>
  );
};

export default QuizPlayerDemo;