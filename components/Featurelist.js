'use client';
import { Check } from "lucide-react";

export default function FeatureList() {
  const features = [
    "Unlimited practice questions",
    "Detailed explanations for all answers",
    "Performance tracking and analytics",
    "Study notes and summaries",
    "Mock exams with timing",
    "Progress reports",
    "Mobile-friendly interface"
  ];

  return (
    <div className="space-y-2">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
          <span className="text-gray-600 text-sm">{feature}</span>
        </div>
      ))}
    </div>
  );
}
