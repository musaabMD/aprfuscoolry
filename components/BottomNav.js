'use client';
import { Home, BookOpen, FileQuestion, ClipboardCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: 'Home1',
    value: 'home',
    icon: Home
  },
  {
    name: 'Learn',
    value: 'learn',
    icon: BookOpen
  },
  {
    name: 'Practice',
    value: 'practice',
    icon: FileQuestion
  },
  {
    name: 'Review',
    value: 'review',
    icon: FileText
  },
  {
    name: 'Mock',
    value: 'mock',
    icon: ClipboardCheck
  }
];

export function BottomNav({ activeTab, setActiveTab }) {
  return (
    <div className="bg-white border-t shadow-lg w-full">
      <nav className="h-16 w-full flex items-center justify-between px-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.value;
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full",
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}