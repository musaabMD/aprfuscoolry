'use client';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Blueprint from '@/components/tabs/Blueprint';
import { useExam } from '@/components/contexts/ExamContext';

export default function Mock({ mockExamHistory = [] }) {
  const router = useRouter();
  const { selectedExam } = useExam();
  
  const handleStartMock = () => {
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }
    router.push(`/session?type=mock&exam=${selectedExam}`);
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Blueprint Component */}
        <Blueprint selectedExam={selectedExam} />
        
        {/* Mock Exam History */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">Mock Exam History</h2>
          {mockExamHistory && mockExamHistory.length > 0 ? (
            <div className="space-y-4">
              {mockExamHistory.map((exam, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold">{exam.subjects} Mock Exam</p>
                    <p className="text-sm text-gray-600">{exam.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{exam.score}%</p>
                    <p className={`text-sm ${
                      exam.comment === 'Pass' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {exam.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No mock exam history yet.</p>
              <p className="text-sm">Take your first mock exam to see your results here.</p>
            </div>
          )}
        </div>
        
        {/* Start Button */}
        <Button
          className="w-full py-4"
          onClick={handleStartMock}
        >
          Start Mock Exam
        </Button>
      </div>
    </div>
  );
}