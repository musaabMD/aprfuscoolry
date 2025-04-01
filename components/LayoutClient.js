// components/LayoutClient.js
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useExam } from '@/components/contexts/ExamContext';
import { createClient } from "@/libs/supabase/client";
import { Crisp } from "crisp-sdk-web";
import NextTopLoader from "nextjs-toploader";
import { Tooltip } from "react-tooltip";
import config from "@/config";

// Crisp customer chat support component
const CrispChat = () => {
  const pathname = usePathname();
  const supabase = createClient();
  const [data, setData] = useState(null);

  // Get user data from Supabase Auth
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setData({ user });
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (config?.crisp?.id) {
      // Set up Crisp
      Crisp.configure(config.crisp.id);
      
      // Hide Crisp based on route config
      if (
        config.crisp.onlyShowOnRoutes &&
        !config.crisp.onlyShowOnRoutes?.includes(pathname)
      ) {
        Crisp.chat.hide();
        Crisp.chat.onChatClosed(() => {
          Crisp.chat.hide();
        });
      }
    }
  }, [pathname]);

  // Add User Unique ID to Crisp
  useEffect(() => {
    if (data?.user && config?.crisp?.id) {
      Crisp.session.setData({ userId: data.user?.id });
    }
  }, [data]);

  return null;
};

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedExam, selectExam } = useExam();
  
  const handleExamChange = (examId, examData) => {
    selectExam(examId, examData);
  };
  
  const hideNavOn = ['/signin', '/signup', '/forgot-password', '/reset-password'];
  const shouldShowNav = !hideNavOn.some(path => pathname.startsWith(path));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-screen-xl mx-auto relative">
      <NextTopLoader color={config.colors.main} showSpinner={false} />
      
      {shouldShowNav && <Header 
        showAuth={!pathname.startsWith('/dashboard')}
        onExamChange={handleExamChange}
        selectedExam={selectedExam}
      />}
      
      <main className="flex-1 w-full pt-20">
        {children}
      </main>
      
      <Tooltip
        id="tooltip"
        className="z-[60] !opacity-100 max-w-sm shadow-lg"
      />
      <CrispChat />
    </div>
  );
}