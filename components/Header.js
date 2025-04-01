// components/Header.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/contexts/UserContext';
import { useExam } from '@/components/contexts/ExamContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import AddExamContent from '@/components/AddExamContent';
import { toast } from 'react-hot-toast';

const Header = ({ showAuth = true, onExamChange, setActiveTab }) => {
  const { user } = useUser();
  const { selectedExam, selectExam, examData } = useExam();
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [exams, setExams] = useState({});
  
  // Simulate fetching exams from storage
  useEffect(() => {
    // This would normally be fetched from Supabase
    // For now, we'll use localStorage or mock data
    const storedExamData = typeof window !== 'undefined' ? 
      localStorage.getItem('examData') : null;
    
    if (storedExamData) {
      try {
        setExams(JSON.parse(storedExamData));
      } catch (e) {
        console.error('Error parsing stored exam data:', e);
      }
    } else {
      // Mock data as fallback
      setExams({
        "NREMT": {
          id: "nremt",
          description: "National Registry of Emergency Medical Technicians",
          color: "#3B82F6",
          questions: 120
        }
      });
    }
  }, []);

  // Handle exam selection
  const handleExamChange = (examName) => {
    if (examName === "add-new") {
      // Open the Add Exam side sheet
      setIsAddExamOpen(true);
      return;
    }
    selectExam?.(examName);
    onExamChange?.(examName, exams[examName]);
  };

  // Handle adding a new exam
  const handleAddExam = (newExam) => {
    // Add the new exam to the list
    const updatedExams = {
      ...exams,
      [newExam.name]: {
        id: newExam.id || newExam.name.toLowerCase().replace(/\s+/g, '-'),
        description: newExam.description,
        color: newExam.color || "#3B82F6",
        questions: newExam.questions || 0,
        hyNotes: newExam.hyNotes || 0
      }
    };
    
    setExams(updatedExams);
    
    // Update localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('examData', JSON.stringify(updatedExams));
    }
    
    // Select the new exam
    selectExam?.(newExam.name);
    onExamChange?.(newExam.name, updatedExams[newExam.name]);
    
    // Close the side sheet
    setIsAddExamOpen(false);
    
    // Navigate to home tab
    setActiveTab?.("home");
    
    // Show success toast
    toast.success(`${newExam.name} has been added!`);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo and App Name */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2" onClick={() => setActiveTab?.("home")}>
              <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <span className="text-lg font-bold">Scoorly</span>
            </Link>
          </div>
          
          {/* Exam Selector in Header */}
          {user && Object.keys(exams).length > 0 && (
            <div className="flex-1 max-w-[180px] mx-4">
              <Select 
                value={selectedExam || Object.keys(exams)[0]} 
                onValueChange={handleExamChange}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 h-9">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(exams).map((examName) => (
                    <SelectItem key={examName} value={examName}>{examName}</SelectItem>
                  ))}
                  <SelectItem value="add-new" className="text-blue-600">
                    <div className="flex items-center">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add New Exam
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* User Information */}
          <div className="flex items-center">
            {user ? (
              <span className="text-sm font-medium">
                {user.email?.split('@')[0] || 'mousab.r'}
              </span>
            ) : showAuth ? (
              <Link href="/signin">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
            ) : null}
          </div>
        </div>
      </header>

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
    </>
  );
};

export default Header;