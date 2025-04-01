// components/AddExamContent.js
'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Activity, Award, FileText, Plus } from "lucide-react";
import { toast } from 'react-hot-toast';
import FeatureList from "@/components/Featurelist";

const AddExamContent = ({ onAddExam, onCancel }) => {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [examData, setExamData] = useState({
    name: "",
    description: "",
    questions: 0,
    hyNotes: 0,
    categories: [],
    color: "#4F46E5", // Default indigo color
    purchaseType: "free"
  });

  const predefinedExams = [
    { 
      id: "nremt", 
      name: "NREMT", 
      description: "National Registry of Emergency Medical Technicians certification exam",
      questions: 120,
      hyNotes: 45,
      categories: ["Medical", "Trauma", "Airway", "Operations"],
      color: "#3B82F6", // Blue
      icon: <Activity className="h-6 w-6 text-white" />
    },
    { 
      id: "abem", 
      name: "ABEM", 
      description: "American Board of Emergency Medicine certification",
      questions: 225,
      hyNotes: 70,
      categories: ["Critical Care", "Procedures", "Pediatrics", "Toxicology"],
      color: "#059669", // Green
      icon: <Award className="h-6 w-6 text-white" />
    },
    { 
      id: "cpa", 
      name: "CPA Exam", 
      description: "Certified Public Accountant examination",
      questions: 350,
      hyNotes: 120,
      categories: ["Auditing", "Financial", "Regulation", "Business"],
      color: "#9333EA", // Purple
      icon: <FileText className="h-6 w-6 text-white" />
    },
    { 
      id: "custom", 
      name: "Custom Exam", 
      description: "Create your own custom exam",
      questions: 0,
      hyNotes: 0,
      categories: [],
      color: "#DC2626", // Red
      icon: <Plus className="h-6 w-6 text-white" />
    }
  ];

  const handleSelectExam = (exam) => {
    if (exam.id === "custom") {
      setStep(2);
    } else {
      setExamData({
        id: exam.id,
        name: exam.name,
        description: exam.description,
        questions: exam.questions,
        hyNotes: exam.hyNotes,
        categories: exam.categories,
        color: exam.color,
        purchaseType: "free"
      });
      setStep(3);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExamData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Validate exam data
    if (!examData.name) {
      toast.error("Please enter an exam name");
      return;
    }
    
    // Save the exam
    onAddExam(examData);
    toast.success(`${examData.name} has been added!`);
  };

  return (
    <div className="w-full">
      {step === 1 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Choose an Exam</h2>
          <p className="text-gray-600 mb-4">Select from our pre-configured exams or create your own custom exam.</p>
          
          {/* Search Box */}
          <div className="relative mb-6">
            <Input 
              type="text" 
              placeholder="Search exams..." 
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery("")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {predefinedExams
              .filter(exam => 
                searchQuery === "" || 
                exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.description.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((exam) => (
              <div 
                key={exam.id} 
                className="bg-white p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors flex items-center"
                onClick={() => handleSelectExam(exam)}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0" 
                  style={{ backgroundColor: exam.color }}
                >
                  {exam.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{exam.name}</h3>
                  <p className="text-sm text-gray-600">{exam.description}</p>
                </div>
                <div className="text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </div>
            ))}
            
            {/* No results message */}
            {predefinedExams.filter(exam => 
              searchQuery === "" || 
              exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              exam.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No exams found</h3>
                <p className="text-gray-500">Try a different search term or add a custom exam</p>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    handleSelectExam(predefinedExams[3]); // Select custom exam option
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Exam
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Custom Exam Details</h2>
          <p className="text-gray-600 mb-6">Fill in the details for your custom exam.</p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Exam Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={examData.name} 
                onChange={handleInputChange} 
                placeholder="e.g., Medical Board Exam"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={examData.description} 
                onChange={handleInputChange} 
                placeholder="Briefly describe this exam"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questions">Number of Questions</Label>
                <Input 
                  id="questions" 
                  name="questions" 
                  type="number" 
                  value={examData.questions} 
                  onChange={handleInputChange} 
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hyNotes">Number of Study Notes</Label>
                <Input 
                  id="hyNotes" 
                  name="hyNotes" 
                  type="number" 
                  value={examData.hyNotes} 
                  onChange={handleInputChange} 
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="pt-4 flex space-x-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Access Options</h2>
          <p className="text-gray-600 mb-6">Choose how you want to access this exam content.</p>
          
          <RadioGroup 
            defaultValue={examData.purchaseType}
            onValueChange={(value) => setExamData(prev => ({ ...prev, purchaseType: value }))}
            className="space-y-3"
          >
            <div className="bg-white p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors flex items-center">
              <div className="mr-3">
                <RadioGroupItem value="free" id="free" />
              </div>
              <Label htmlFor="free" className="cursor-pointer flex-1">
                <div className="font-medium">Free Preview</div>
                <p className="text-sm text-gray-600">Access a limited set of questions and materials</p>
              </Label>
              <div className="text-lg font-bold text-gray-800">
                $0
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 cursor-pointer hover:border-blue-300 transition-colors flex items-center">
              <div className="mr-3">
                <RadioGroupItem value="premium" id="premium" />
              </div>
              <Label htmlFor="premium" className="cursor-pointer flex-1">
                <div className="font-medium">Annual Premium Access</div>
                <p className="text-sm text-gray-600">Full access to all premium features</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-blue-600">$49</span>
                  <span className="text-sm line-through text-gray-500">$120</span>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Save 59%</span>
                </div>
                <div className="mt-3">
                  <FeatureList />
                </div>
              </Label>
            </div>
          </RadioGroup>
          
          <div className="pt-6 flex flex-col gap-4">
            <Button 
              onClick={handleSubmit} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6"
            >
              {examData.purchaseType === 'premium' ? (
                <>Add Exam & Unlock Premium - $49/year</>
              ) : (
                <>Add Free Exam</>
              )}
            </Button>
            <Button variant="outline" onClick={() => setStep(2)} className="w-full">
              Back
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddExamContent;