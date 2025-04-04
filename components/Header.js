// components/Header.js
'use client';

import { useState } from 'react';
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
  const { selectedExam, selectExam, userExams, loading, addExam } = useExam();
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);

  // Handle exam selection
  const handleExamChange = (examName) => {
    if (examName === "add-new") {
      setIsAddExamOpen(true);
      return;
    }
    selectExam(examName);
    onExamChange?.(examName);
  };

  // Handle adding a new exam
  const handleAddExam = async (newExam) => {
    try {
      await addExam(newExam);
      setIsAddExamOpen(false);
      setActiveTab?.("home");
      toast.success(`${newExam.name} has been added!`);
    } catch (error) {
      console.error('Error adding exam:', error);
      toast.error('Failed to add exam. Please try again.');
    }
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
          {user && (
            <div className="flex-1 max-w-[180px] mx-4">
              <Select 
                value={selectedExam || "no-selection"} 
                onValueChange={handleExamChange}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 h-9">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {!loading && Object.keys(userExams).length > 0 ? (
                    <>
                      {Object.keys(userExams).map((examName) => (
                        <SelectItem key={examName} value={examName}>
                          {examName}
                        </SelectItem>
                      ))}
                      <SelectItem value="add-new">
                        <div className="flex items-center text-blue-600">
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Add New Exam
                        </div>
                      </SelectItem>
                    </>
                  ) : loading ? (
                    <SelectItem value="loading">
                      <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    </SelectItem>
                  ) : (
                    <SelectItem value="add-new">
                      <div className="flex items-center text-blue-600">
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Your First Exam
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* User Information */}
          <div className="flex items-center">
            {user ? (
              <span className="text-sm font-medium">
                {user.email?.split('@')[0]}
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
            <AddExamContent 
              user={user}
              onAddExam={handleAddExam} 
              onCancel={() => setIsAddExamOpen(false)} 
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;