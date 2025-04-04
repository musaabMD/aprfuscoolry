// components/AddExamContent.js
'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Activity, Award, FileText } from "lucide-react";
import { toast } from 'react-hot-toast';
import FeatureList from "@/components/Featurelist";
import { createBrowserClient } from '@supabase/ssr';
import { Label } from "@/components/ui/label";

const AddExamContent = ({ onAddExam, onCancel, user }) => {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [predefinedExams, setPredefinedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState({
    purchaseType: "free"
  });

  // Fetch predefined exams from Supabase
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        // First get user's existing exam access
        const { data: userExams, error: userExamsError } = await supabase
          .from('user_exam_access')
          .select('exam_id')
          .eq('user_id', user?.id);

        if (userExamsError) {
          console.error('Error fetching user exams:', userExamsError);
          return;
        }

        const userExamIds = userExams?.map(ue => ue.exam_id) || [];

        // Get all active exams
        let query = supabase
          .from('exams')
          .select(`
            id,
            name,
            description,
            subjects (
              id,
              name
            )
          `)
          .eq('is_active', true);

        // If user has existing exams, exclude them
        if (userExamIds.length > 0) {
          query = query.not('id', 'in', `(${userExamIds.join(',')})`);
        }

        const { data: exams, error } = await query;

        if (error) throw error;

        // Transform the data
        const formattedExams = exams.map(exam => ({
          id: exam.id,
          name: exam.name,
          description: exam.description || '',
          categories: exam.subjects?.map(s => s.name) || [],
          color: getExamColor(exam.name),
          icon: getExamIcon(exam.name)
        }));

        setPredefinedExams(formattedExams);
      } catch (error) {
        console.error('Error fetching exams:', error);
        toast.error('Failed to load exam templates');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchExams();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Helper function to get a color based on exam name
  const getExamColor = (examName) => {
    const colors = {
      'NREMT': '#3B82F6',
      'ABEM': '#059669',
      'CPA': '#9333EA',
      'default': '#4F46E5'
    };
    return colors[examName] || colors.default;
  };

  // Helper function to get an icon based on exam name
  const getExamIcon = (examName) => {
    const icons = {
      'NREMT': <Activity className="h-6 w-6 text-white" />,
      'ABEM': <Award className="h-6 w-6 text-white" />,
      'CPA': <FileText className="h-6 w-6 text-white" />,
      'default': <FileText className="h-6 w-6 text-white" />
    };
    return icons[examName] || icons.default;
  };

  const handleSelectExam = (exam) => {
    setExamData({
      id: exam.id,
      name: exam.name,
      description: exam.description,
      categories: exam.categories,
      purchaseType: "free"
    });
    setStep(2);
  };

  const handleSubmit = () => {
    if (!examData.id || !examData.name) {
      toast.error('Please select an exam first');
      return;
    }

    onAddExam({
      id: examData.id,
      name: examData.name,
      description: examData.description,
      categories: examData.categories,
      purchaseType: examData.purchaseType || 'free'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (predefinedExams.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No exams available</h3>
        <p className="text-gray-500">Please check back later for available exams</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {step === 1 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Choose an Exam</h2>
          <p className="text-gray-600 mb-4">Select from our available exams.</p>
          
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
          </div>
        </>
      )}

      {step === 2 && (
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
            <Button variant="outline" onClick={() => setStep(1)} className="w-full">
              Back
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddExamContent;