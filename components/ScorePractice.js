import { Button } from "@/components/ui/button";
import { Trophy, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function ScorePractice({ score, timeSpent, totalQuestions }) {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Practice Complete!</h1>
          <p className="text-blue-100">Great job on completing your practice session</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{percentage}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{timeSpent}</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Questions</div>
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
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Return to Dashboard
              </Button>
            </Link>
            <Link href="/session?mode=practice" className="flex-1">
              <Button className="w-full">
                Start New Practice
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
