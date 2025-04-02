import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { List, CheckCircle2, Circle, Flag, X, ChevronLeft, ChevronRight, Clock, MessageCircle } from 'lucide-react';
import { useUser } from '@/components/contexts/UserContext';
import { useExam } from '@/components/contexts/ExamContext';

const ImprovedExamApp = ({ onExit }) => {
  const router = useRouter();
  const { user } = useUser();
  const { selectedExam, examData } = useExam();
  // Sample question data
  const questions = [
    {
      id: "e10",
      number: 1,
      text: "A 13-year-old girl is brought to the clinic by her mother for a yearly physical examination. The patient feels well but is worried that she has not yet started puberty. Temperature is 36.7 C (98 F), blood pressure is 152/91 mm Hg, pulse is 75/min, and respirations are 18/min. Physical examination is significant for a lack of secondary sexual characteristics; a blind vagina is noted on pelvic examination. Laboratory studies reveal hypokalemia and low testosterone and estradiol levels. Cytogenetic analysis shows a 46,XY karyotype. This patient most likely has deficiency of which of the following enzymes?",
      options: [
        { id: "A", text: "5 alpha-reductase" },
        { id: "B", text: "11 beta-hydroxylase" },
        { id: "C", text: "17 alpha-hydroxylase" },
        { id: "D", text: "20,22-desmolase" },
        { id: "E", text: "21-hydroxylase" }
      ]
    },
    {
      id: "e11",
      number: 2,
      text: "A 45-year-old patient presents with unexplained weight loss, increased thirst, and frequent urination. Lab tests show elevated blood glucose levels. Which of the following is the most likely diagnosis?",
      options: [
        { id: "A", text: "Type 1 Diabetes" },
        { id: "B", text: "Type 2 Diabetes" },
        { id: "C", text: "Hypothyroidism" },
        { id: "D", text: "Addison's Disease" },
        { id: "E", text: "Cushing's Syndrome" }
      ]
    },
    {
      id: "e12",
      number: 3,
      text: "A 60-year-old male presents with chest pain, shortness of breath, and elevated troponin levels. What is the most appropriate immediate treatment?",
      options: [
        { id: "A", text: "Aspirin" },
        { id: "B", text: "Beta-blockers" },
        { id: "C", text: "Thrombolytics" },
        { id: "D", text: "Nitroglycerin" },
        { id: "E", text: "All of the above" }
      ]
    }
  ];

  // User info
  const userInfo = {
    name: "John Smith",
    email: "john.smith@example.com"
  };

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState({});
  const [timeRemaining, setTimeRemaining] = useState("00:10:30");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const sidebarRef = useRef();

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore key events when typing in textareas or inputs
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowLeft':
          if (currentQuestionIndex > 0) handlePrevious();
          break;
        case 'ArrowRight':
          if (currentQuestionIndex < questions.length - 1) handleNext();
          break;
        case 'm':
        case 'M':
          handleMarkToggle(currentQuestion.id);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          const optionIndex = parseInt(e.key) - 1;
          if (optionIndex < currentQuestion.options.length) {
            handleAnswerSelect(currentQuestion.id, currentQuestion.options[optionIndex].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, questions.length, currentQuestion]);

  const getFilteredQuestions = () => {
    switch (activeFilter) {
      case 'answered':
        return questions.filter(q => selectedAnswers[q.id]);
      case 'unanswered':
        return questions.filter(q => !selectedAnswers[q.id]);
      case 'marked':
        return questions.filter(q => markedQuestions[q.id]);
      default:
        return questions;
    }
  };

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleMarkToggle = (questionId) => {
    setMarkedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleQuestionChange = (index) => {
    setCurrentQuestionIndex(index);
    // On mobile, close the sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const openSubmitModal = () => {
    setShowModal(true);
  };

  const handleSubmitExam = async () => {
    setShowModal(false);
    const results = {
      completed: true,
      score: Object.keys(selectedAnswers).length,
      timeSpent: timeRemaining,
      totalQuestions: questions.length
    };
    
    if (typeof onExit === 'function') {
      await onExit(results);
    }
  };

  const handleSubmitFeedback = async () => {
    // Here you would typically send the feedback to your backend
    setShowFeedbackModal(false);
    setFeedback('');
    // Show success toast or message
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center z-20">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="text-xl focus:outline-none hover:text-blue-200 transition-colors"
            aria-label={isSidebarOpen ? "Close question navigator" : "Open question navigator"}
          >
            {isSidebarOpen ? <X size={24} /> : <List size={24} />}
          </button>
          <div>
            <h1 className="font-bold text-lg">{selectedExam || 'Medical Exam'}</h1>
            <p className="text-xs text-blue-200">Question {currentQuestion.number} of {questions.length}</p>
          </div>
        </div>
        
        <div className="text-sm text-right">
          <div className="font-medium">{user?.email?.split('@')[0] || 'Guest'}</div>
          <div className="text-xs text-blue-200">{user?.email || ''}</div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`
            fixed top-0 left-0 h-full w-72
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            bg-white shadow-lg z-10
          `}
        >
          <div className="flex flex-col h-full pt-16">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-700">Questions</h2>
              
              {/* Icon Tabs */}
              <div className="flex mt-3 bg-white rounded-lg p-1 shadow-sm">
                {[
                  { id: 'all', icon: <List size={18} />, label: 'All Questions' },
                  { id: 'answered', icon: <CheckCircle2 size={18} />, label: 'Answered' },
                  { id: 'unanswered', icon: <Circle size={18} />, label: 'Unanswered' },
                  { id: 'marked', icon: <Flag size={18} />, label: 'Marked' }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`
                      flex-1 p-2 rounded-md transition-colors
                      ${activeFilter === filter.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                    title={filter.label}
                  >
                    {filter.icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {getFilteredQuestions().map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => handleQuestionChange(index)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg
                      transition-all duration-200
                      ${index === currentQuestionIndex 
                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' 
                        : 'hover:bg-gray-50 text-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <span className={`
                        w-8 h-8 flex items-center justify-center rounded-lg mr-3
                        ${selectedAnswers[question.id] 
                          ? 'bg-green-100 text-green-600' 
                          : index === currentQuestionIndex
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }
                        font-medium
                      `}>
                        {index + 1}
                      </span>
                      {selectedAnswers[question.id] && (
                        <CheckCircle2 size={16} className="text-green-600" />
                      )}
                    </div>
                    {markedQuestions[question.id] && (
                      <Flag size={16} className="text-yellow-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
              {/* Question Text - No box, full width */}
              <div className="text-xl text-gray-800 leading-relaxed mb-8">
                {currentQuestion.text}
              </div>
              
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <div 
                    key={option.id} 
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                    className={`
                      w-full p-4 rounded-lg cursor-pointer transition-all duration-200
                      ${selectedAnswers[currentQuestion.id] === option.id 
                        ? 'bg-blue-50 ring-2 ring-blue-500' 
                        : 'bg-white hover:bg-gray-50'}
                      shadow-sm hover:shadow
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold shrink-0
                        ${selectedAnswers[currentQuestion.id] === option.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700'}
                      `}>
                        {option.id}
                      </div>
                      <div className="text-lg text-gray-800">{option.text}</div>
                    </div>
                    <div className="mt-1 ml-14 text-xs text-gray-500">
                      Press {index + 1} to select
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-600 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePrevious} 
            disabled={currentQuestionIndex === 0}
            className={`p-2 rounded-full transition-colors ${
              currentQuestionIndex === 0 
                ? 'bg-blue-700 text-blue-300 cursor-not-allowed' 
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
            title="Previous Question (←)"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
            className={`p-2 rounded-full transition-colors ${
              currentQuestionIndex === questions.length - 1
                ? 'bg-blue-700 text-blue-300 cursor-not-allowed' 
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
            title="Next Question (→)"
          >
            <ChevronRight size={20} />
          </button>
          
          <button 
            onClick={() => handleMarkToggle(currentQuestion.id)}
            className={`
              p-2 rounded-full transition-colors
              ${markedQuestions[currentQuestion.id]
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-white text-blue-600 hover:bg-blue-50'}
            `}
            title="Mark Question (M)"
          >
            <Flag size={20} />
          </button>

          <button
            onClick={() => setShowFeedbackModal(true)}
            className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-colors"
            title="Give Feedback"
          >
            <MessageCircle size={20} />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-blue-700 px-4 py-2 rounded-full text-white">
            <Clock size={16} />
            <span className="font-mono font-medium">{timeRemaining}</span>
          </div>
          
          <button 
            onClick={openSubmitModal}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-full font-medium transition-colors"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Submit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Submit Exam</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to submit your exam? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitExam}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Give Feedback</h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please share your feedback about this question..."
              className="w-full h-32 p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitFeedback}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedExamApp;