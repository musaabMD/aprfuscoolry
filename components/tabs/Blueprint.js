'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Info } from "lucide-react";

export default function Blueprint({ selectedExam }) {
  const [examBlueprint, setExamBlueprint] = useState([]);
  
  useEffect(() => {
    if (!selectedExam) return;
    
    // This would ideally come from an API or context
    // Mapping exam IDs to their respective blueprints
    const blueprints = {
      'nremt': [
        { subject: 'Medical', percentage: 30, color: '#3B82F6' },
        { subject: 'Trauma', percentage: 25, color: '#EF4444' },
        { subject: 'Airway', percentage: 20, color: '#10B981' },
        { subject: 'Operations', percentage: 15, color: '#F59E0B' },
        { subject: 'Cardiology', percentage: 10, color: '#8B5CF6' },
      ],
      'abem': [
        { subject: 'Critical Care', percentage: 23, color: '#3B82F6' },
        { subject: 'Procedures', percentage: 21, color: '#EF4444' },
        { subject: 'Pediatrics', percentage: 18, color: '#10B981' },
        { subject: 'Toxicology', percentage: 15, color: '#F59E0B' },
        { subject: 'Environmental', percentage: 13, color: '#8B5CF6' },
        { subject: 'Infectious Disease', percentage: 10, color: '#EC4899' },
      ],
      'cpa': [
        { subject: 'Auditing', percentage: 30, color: '#3B82F6' },
        { subject: 'Financial', percentage: 30, color: '#10B981' },
        { subject: 'Regulation', percentage: 25, color: '#F59E0B' },
        { subject: 'Business', percentage: 15, color: '#8B5CF6' },
      ],
      'custom': [
        { subject: 'Subject 1', percentage: 33, color: '#3B82F6' },
        { subject: 'Subject 2', percentage: 33, color: '#10B981' },
        { subject: 'Subject 3', percentage: 34, color: '#F59E0B' },
      ],
    };
    
    setExamBlueprint(blueprints[selectedExam] || []);
  }, [selectedExam]);

  if (!selectedExam || examBlueprint.length === 0) {
    return (
      <Card className="bg-white shadow rounded-lg">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
          <Info className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500">Please select an exam to view its blueprint</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Exam Blueprint</CardTitle>
        <p className="text-sm text-gray-500">Content breakdown by subject area</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {examBlueprint.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.subject}</span>
              <span className="text-sm font-semibold">{item.percentage}%</span>
            </div>
            <Progress 
              value={item.percentage} 
              max={100} 
              className="h-2 w-full" 
              indicatorClassName="bg-gradient-to-r" 
              style={{ 
                '--tw-gradient-from': item.color,
                '--tw-gradient-to': `${item.color}dd`
              }} 
            />
          </div>
        ))}
        
        <div className="border-t pt-4 mt-4">
          <p className="text-xs text-gray-500">
            This blueprint represents the approximate distribution of questions you'll encounter on the exam. Study accordingly to maximize your chances of success.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}