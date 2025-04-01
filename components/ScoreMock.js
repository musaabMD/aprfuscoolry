import { Button } from "@/components/ui/button";
import { Trophy, Clock, CheckCircle2, XCircle, Download } from "lucide-react";
import Link from "next/link";

export default function ScoreMock({ score, timeSpent, totalQuestions }) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 70;
  
  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className={`${passed ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-orange-600 to-orange-700'} p-6 text-white text-center`}>
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Mock Exam Results</h1>
          <p className="text-gray-100">
            {passed ? 'Congratulations! You passed!' : 'Keep practicing! You can do it!'}
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className={`text-4xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-orange-600'}`}>
                {percentage}%
              </div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{timeSpent}</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span>Correct Answers: {score}</span>
            </div>
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="w-5 h-5" />
              <span>Incorrect Answers: {totalQuestions - score}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
