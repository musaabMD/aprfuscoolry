import { Inter } from "next/font/google";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";
import { UserProvider } from '@/components/contexts/UserContext';
import { ExamProvider } from '@/components/contexts/ExamContext';
import { QuizSessionProvider } from "@/components/contexts/QuizSessionContext";
import { Toaster } from 'react-hot-toast';

const font = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme={config.colors.theme}
      className={font.className}
    >
      <body className="bg-gray-50 overflow-x-hidden">
        <UserProvider>
          <ExamProvider>
            <QuizSessionProvider>
              {children}
            </QuizSessionProvider>
            <Toaster position="bottom-center" />
          </ExamProvider>
        </UserProvider>
      </body>
    </html>
  );
}