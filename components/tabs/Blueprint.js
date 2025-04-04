'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Info } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';

export default function Blueprint({ selectedExam }) {
  const [examBlueprint, setExamBlueprint] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!selectedExam) return;
    
    const fetchBlueprint = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        // Get exam ID first
        const { data: exam } = await supabase
          .from('exams')
          .select('id')
          .eq('name', selectedExam)
          .single();

        if (!exam) return;

        // Get subjects with question counts
        const { data: subjects } = await supabase
          .from('subjects')
          .select(`
            id,
            name,
            questions:questions(count)
          `)
          .eq('exam_id', exam.id);

        if (subjects) {
          // Calculate total questions
          const totalQuestions = subjects.reduce((total, subject) => {
            const questionCount = subject.questions?.[0]?.count || 0;
            return total + questionCount;
          }, 0);

          // Calculate percentages and format data
          const blueprint = subjects.map(subject => {
            const questionCount = subject.questions?.[0]?.count || 0;
            const percentage = totalQuestions > 0 
              ? Math.round((questionCount / totalQuestions) * 100)
              : 0;

            return {
              subject: subject.name,
              percentage,
              color: getSubjectColor(subject.name)
            };
          });

          setExamBlueprint(blueprint);
        }
      } catch (error) {
        console.error('Error fetching blueprint:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlueprint();
  }, [selectedExam]);

  // Helper function to get a color based on subject name
  const getSubjectColor = (subjectName) => {
    const colors = [
      '#3B82F6', // blue
      '#EF4444', // red
      '#10B981', // green
      '#F59E0B', // yellow
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#6366F1', // indigo
      '#14B8A6'  // teal
    ];

    // Use hash function to consistently assign colors
    const hash = subjectName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  if (!selectedExam || loading) {
    return (
      <Card className="bg-white shadow rounded-lg">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
          <Info className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500">
            {!selectedExam ? 'Please select an exam to view its blueprint' : 'Loading blueprint...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (examBlueprint.length === 0) {
    return (
      <Card className="bg-white shadow rounded-lg">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
          <Info className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500">No blueprint data available for this exam</p>
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