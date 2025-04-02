import { Button } from "@/components/ui/button";
import { Trophy, Clock, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ScorePractice({ score, timeSpent, totalQuestions }) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const getScoreColor = () => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
          <h1 className="text-2xl font-bold mb-1 text-white">Practice Complete!</h1>
          <p className="text-blue-100 text-sm">Great effort on completing your practice session</p>
        </div>
        
        <div className="p-6">
          {/* Score Display */}
          <div className="text-center mb-8">
            <div className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>
              {percentage}%
            </div>
            <div className="text-sm text-gray-600">
              Final Score
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xl font-bold">{score}</span>
              </div>
              <div className="text-xs text-gray-600">Correct</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 text-red-600 mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-xl font-bold">{totalQuestions - score}</span>
              </div>
              <div className="text-xs text-gray-600">Incorrect</div>
            </div>
          </div>

          {/* Time Info */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{timeSpent}</span>
            </div>
            <div className="text-center text-xs text-blue-600 mt-1">
              Time Taken
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </Link>
            <Link href="/session?type=practice" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start New Practice
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
