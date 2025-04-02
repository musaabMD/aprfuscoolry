'use client';
import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useRouter } from 'next/navigation';
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

export default function Practice({ selectedExam, exams, onStartPractice }) {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState(50);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All Questions");
  const [showAnswers, setShowAnswers] = useState("as-go");
  
  // EMS subjects progress data
  const progressData = [
    { subject: "Airway, Respiration & Ventilation", score: 78, correct: 7, total: 9, questions: 45 },
    { subject: "Cardiology & Resuscitation", score: 89, correct: 8, total: 9, questions: 52 },
    { subject: "Clinical Judgment", score: 56, correct: 5, total: 9, questions: 38 },
    { subject: "EKG Monitoring", score: 67, correct: 6, total: 9, questions: 42 },
    { subject: "EMS Operations", score: 38, correct: 3, total: 8, questions: 35 },
    { subject: "Medical & Obstetrics/Gynecology", score: 92, correct: 11, total: 12, questions: 64 },
    { subject: "Trauma", score: 71, correct: 5, total: 7, questions: 40 },
    { subject: "Tra2uma", score: 71, correct: 5, total: 7, questions: 40 }

  ];

  // Sort subjects by score (ascending) to prioritize weaker areas
  const sortedSubjects = useMemo(() => {
    return [...progressData].sort((a, b) => a.score - b.score);
  }, []);
  
  // Calculate total selected questions
  const totalSelectedQuestions = useMemo(() => {
    return selectedSubjects.reduce((total, subject) => {
      const subjectData = progressData.find(item => item.subject === subject);
      return total + (subjectData?.questions || 0);
    }, 0);
  }, [selectedSubjects, progressData]);
  
  // Function to determine color based on score
  const getProgressBarColor = (score) => {
    if (score >= 85) return "bg-green-500"; // Excellent
    if (score >= 60) return "bg-yellow-400"; // Ok
    return "bg-red-500"; // Fail
  };

  const getScoreBadge = (score) => {
    if (score >= 85) return "bg-green-100 text-green-800 border-green-300 pointer-events-none"; 
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-300 pointer-events-none"; 
    return "bg-red-100 text-red-800 border-red-300 pointer-events-none"; 
  };
  
  const handleStartPractice = () => {
    const practiceConfig = {
      subjects: selectedSubjects,
      questionCount,
      filter: selectedFilter,
      showAnswers,
      exam: selectedExam
    };
    
    // Save config to localStorage for persistence
    localStorage.setItem('practiceConfig', JSON.stringify(practiceConfig));
    
    router.push(`/session?type=practice&exam=${selectedExam}`);
  };

  const toggleAllSubjects = () => {
    if (selectedSubjects.length === progressData.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(progressData.map(item => item.subject));
    }
  };
  
  return (
    <div className="container mx-auto max-w-5xl px-4 py-4">
      <br />
      <br />
      <br />
      <h1 className="text-2xl font-bold mb-4">Practice Session Setup</h1>
      
      <div className="grid md:grid-cols-12 gap-4">
        {/* Left column - Subject selection */}
        <div className="md:col-span-7">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Subject Selection</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleAllSubjects}
                  className="text-base text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {selectedSubjects.length === progressData.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <CardDescription className="text-base text-gray-500">
                {selectedSubjects.length} of {progressData.length} subjects selected
                ({totalSelectedQuestions} total questions)
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="p-3">
                {sortedSubjects.map((item) => (
                  <div 
                    key={item.subject} 
                    className={`flex items-center p-3 rounded-md cursor-pointer transition-all mb-2 ${
                      selectedSubjects.includes(item.subject) 
                        ? 'bg-blue-50 ring-1 ring-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (selectedSubjects.includes(item.subject)) {
                        setSelectedSubjects(selectedSubjects.filter(s => s !== item.subject));
                      } else {
                        setSelectedSubjects([...selectedSubjects, item.subject]);
                      }
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      selectedSubjects.includes(item.subject) 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100'
                    }`}>
                      {selectedSubjects.includes(item.subject) && <Check className="h-5 w-5" />}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-base">{item.subject}</div>
                        <Badge 
                          className={`${getScoreBadge(item.score)} border text-sm select-none ml-2`}
                          style={{ pointerEvents: 'none' }}
                        >
                          {item.score}%
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span>{item.correct}/{item.total} correct</span>
                        <span className="mx-2">•</span>
                        <span>{item.questions} questions</span>
                      </div>
                      
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div 
                          className={`${getProgressBarColor(item.score)} h-1 rounded-full transition-all`} 
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Practice options */}
        <div className="md:col-span-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Practice Options</CardTitle>
              <CardDescription>Customize your practice session</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Question count */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Number of Questions</Label>
                  <div className="w-16 h-8 bg-gray-100 rounded-md flex items-center justify-center font-medium">
                    {questionCount}
                  </div>
                </div>
                <Slider
                  value={[questionCount]}
                  onValueChange={([value]) => setQuestionCount(value)}
                  max={Math.min(250, totalSelectedQuestions || 250)}
                  min={10}
                  step={5}
                  className="mt-2"
                  disabled={selectedSubjects.length === 0}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10</span>
                  <span>{Math.min(250, totalSelectedQuestions || 250)}</span>
                </div>
              </div>
              
              {/* Tabs for filter options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Question Filter</Label>
                <Tabs defaultValue={selectedFilter} onValueChange={setSelectedFilter} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-2">
                    <TabsTrigger value="All Questions">All Questions</TabsTrigger>
                    <TabsTrigger value="Not Answered">Not Answered</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="Incorrect">Incorrect</TabsTrigger>
                    <TabsTrigger value="Flagged">Flagged</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Answer display preference */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Answer Display</Label>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start py-4 ${showAnswers === "as-go" ? "bg-blue-50 border-blue-500 text-blue-700" : ""}`}
                    onClick={() => setShowAnswers("as-go")}
                  >
                    <Eye className="mr-3 h-5 w-5" />
                    Show as you go
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start py-4 ${showAnswers === "at-end" ? "bg-blue-50 border-blue-500 text-blue-700" : ""}`}
                    onClick={() => setShowAnswers("at-end")}
                  >
                    <EyeOff className="mr-3 h-5 w-5" />
                    Show at end
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex-col gap-3">
              <Button
                className="w-full py-4 bg-blue-600 hover:bg-blue-700"
                onClick={handleStartPractice}
                disabled={selectedSubjects.length === 0}
              >
                Start Practice Session
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              
              {selectedSubjects.length === 0 && (
                <p className="text-sm text-center text-amber-600">
                  Please select at least one subject to practice
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}