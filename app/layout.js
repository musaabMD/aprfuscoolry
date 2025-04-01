import { Inter } from "next/font/google";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";
import { UserProvider } from '@/components/contexts/UserContext';
import { ExamProvider } from '@/components/contexts/ExamContext';
import { Toaster } from 'react-hot-toast';

const font = Inter({ subsets: ["latin"] });

export const viewport = {
  // Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags();

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
            <ClientLayout>
              {children}
            </ClientLayout>
            <Toaster position="bottom-center" />
          </ExamProvider>
        </UserProvider>
      </body>
    </html>
  );
}