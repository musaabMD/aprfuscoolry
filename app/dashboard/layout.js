'use client';
import Header from "@/components/Header";
import { useExam } from '@/components/contexts/ExamContext';

export default function DashboardLayout({ children }) {
  const { selectedExam, selectExam } = useExam();
  
  return (
    <div className="flex h-screen flex-col bg-gray-50 w-full overflow-hidden">
      <Header
        showAuth={false}
        onExamChange={(examId, examData) => selectExam(examId, examData)}
        selectedExam={selectedExam}
        setActiveTab={children.props?.setActiveTab}
      />
      <main className="flex-1 w-full overflow-auto pt-[72px]">
        {children}
      </main>
    </div>
  );
}