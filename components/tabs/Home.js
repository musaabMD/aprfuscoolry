'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Award, Book, PlusCircle, ChevronRight, X, Filter, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import AddExamContent from "@/components/AddExamContent";
import { useExam } from '@/components/contexts/ExamContext';
import { useUser } from '@/components/contexts/UserContext';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FeatureList from "@/components/Featurelist";

export default function Home() {
  const { user } = useUser();
  const { selectedExam, selectExam } = useExam();
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [exams, setExams] = useState({
    "NREMT": {
      id: "nremt",
      description: "National Registry of Emergency Medical Technicians",
      questions: 120,
      hyNotes: 45,
      categories: ["Medical", "Trauma", "Airway", "Operations"],
      progress: "25%",
      lastStudied: "Today",
      color: "#171717"
    }
  });
  const [filterType, setFilterType] = useState('all'); // 'all', 'free', 'paid'
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  // Check if user has any exams
  const hasExams = Object.keys(exams).length > 0;

  // Handle adding a new exam
  const handleAddExam = (examData) => {
    const updatedExams = {
      ...exams,
      [examData.name]: {
        id: examData.id,
        description: examData.description,
        questions: examData.questions,
        hyNotes: examData.hyNotes,
        categories: examData.categories,
        progress: "0%",
        lastStudied: "Never",
        color: "#171717",
        purchaseType: examData.purchaseType
      }
    };
    setExams(updatedExams);
    
    // If this is the first exam, auto-select it
    if (Object.keys(exams).length === 0) {
      selectExam(examData.name);
    } else {
      selectExam(examData.name);
    }
    
    // Close the side sheet
    setIsAddExamOpen(false);
    
    // Show success toast
    toast.success(`${examData.name} has been added!`);
  };

  // Generate icon for exam
  const getExamIcon = (examName) => {
    if (!examName) return <Book className="h-6 w-6 text-white" />;
    
    if (examName.includes("CPA") || examName.includes("Financial")) {
      return <FileText className="h-6 w-6 text-white" />;
    } else if (examName.includes("Medical") || examName.includes("Board")) {
      return <Award className="h-6 w-6 text-white" />;
    } else {
      return <Book className="h-6 w-6 text-white" />;
    }
  };

  const filteredExams = () => {
    return Object.entries(exams).filter(([_, examData]) => {
      if (filterType === 'free') return examData.purchaseType === 'free';
      if (filterType === 'paid') return examData.purchaseType === 'paid';
      return true;
    });
  };

  const handleUpgrade = () => {
    // Add your payment processing logic here
    toast.success("Redirecting to payment...");
  };

  return (
    <div className="w-full h-full overflow-hidden bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 h-full flex flex-col">
        {/* Welcome message - Centered */}
        <div className="mb-8 text-center">
          <div className="max-w-xl mx-auto">
            {user ? (
              <>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold">Welcome Back, {user?.email?.split('@')[0]}!</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => signOut()}
                    className="flex items-center gap-2 border-gray-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
                {!hasExams && (
                  <div className="bg-white border border-gray-300 p-5 rounded-lg shadow-sm mx-auto max-w-md">
                    <p className="mb-3">You haven't added any exams yet.</p>
                    <Button 
                      className="w-full md:w-auto px-6 py-2 bg-black hover:bg-gray-800 text-white" 
                      onClick={() => setIsAddExamOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Your First Exam
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-3">Welcome to Scoorly!</h2>
                <p className="text-gray-600 mb-4">Your path to exam success starts here</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <Link href="/signin" className="flex-1">
                    <Button className="w-full py-2 bg-black hover:bg-gray-800 text-white">Sign In</Button>
                  </Link>
                  <Link href="/signup" className="flex-1">
                    <Button variant="outline" className="w-full py-2 border-black text-black hover:bg-gray-100">Sign Up</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Modified Content Area */}
        <div className="flex-1">
          {user && hasExams && (
            <div className="h-fit max-h-full flex flex-col">
              <div className="bg-white rounded-lg border-2 border-gray-300 shadow-sm flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-lg">My Exams</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          {filterType === 'all' ? 'All' : filterType === 'free' ? 'Free' : 'Paid'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setFilterType('all')}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterType('free')}>Free</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterType('paid')}>Paid</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsAddExamOpen(true)}
                      className="flex items-center border-black text-black hover:bg-gray-100"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Exam
                    </Button>
                  </div>
                </div>
                
                <div className={`${Object.keys(exams).length > 5 ? 'overflow-y-auto max-h-[600px]' : ''}`}>
                  <div className="divide-y">
                    {filteredExams().map(([examName, examData], index) => (
                      <div 
                        key={index} 
                        className="relative p-4 hover:bg-gray-50 transition-colors hover:border-gray-400 border border-transparent"
                      >
                        {examData.purchaseType === 'free' && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-blue-500 text-white px-3 py-1 text-xs rounded-bl-lg">
                            Upgrade Available
                          </div>
                        )}
                        <div className="flex items-center">
                          {/* Exam icon with first letter */}
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0" 
                            style={{ backgroundColor: "#171717" }}
                          >
                            {getExamIcon(examName)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{examName}</h4>
                              {examData.purchaseType === 'free' ? (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                  Free
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  Premium
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <span className="mr-3">{examData.questions?.toLocaleString() || 0} questions</span>
                              <span>{examData.hyNotes || 0} notes</span>
                            </div>
                            
                            {examData.purchaseType === 'free' && (
                              <div className="mt-2 flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1 text-gray-500">
                                  <span className="line-through">$120</span>
                                  <span className="text-blue-600 font-medium">$49/year</span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                  onClick={() => setShowUpgradeDialog(true)}
                                >
                                  Unlock Full Access
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right flex items-center">
                            <div className="mr-3">
                              <div className="text-sm font-medium text-gray-800">{examData.progress || '0%'}</div>
                              <div className="h-1.5 w-16 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className="h-full bg-black rounded-full" 
                                  style={{ width: examData.progress || '0%' }}
                                ></div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {user && !hasExams && (
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-6 text-center mt-4 max-w-2xl mx-auto">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusCircle className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Ready to start studying?</h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Add your first exam to begin tracking your progress and improving your scores.
              </p>
              <Button 
                className="px-6 py-2 bg-black hover:bg-gray-800 text-white" 
                onClick={() => setIsAddExamOpen(true)}
              >
                Browse Available Exams
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Exam Side Sheet */}
      <Sheet open={isAddExamOpen} onOpenChange={setIsAddExamOpen}>
        <SheetContent className="sm:max-w-md p-0 overflow-auto">
          <SheetHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <SheetTitle>Add New Exam</SheetTitle>
              <SheetClose className="rounded-full opacity-70 hover:opacity-100 transition">
                <X className="h-4 w-4" />
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="px-6 py-6">
            <AddExamContent onAddExam={handleAddExam} onCancel={() => setIsAddExamOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Premium Access</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-blue-600">$49</span>
                <span className="text-lg line-through text-gray-500">$120</span>
                <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded-full">Save 59%</span>
              </div>
              <p className="text-gray-600 mb-6">Get unlimited access to all premium features for an entire year</p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <FeatureList />
              </div>
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6"
              onClick={handleUpgrade}
            >
              Upgrade Now - $49/year
            </Button>
            <p className="text-center text-sm text-gray-500 mt-4">
              30-day money-back guarantee. Cancel anytime.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}