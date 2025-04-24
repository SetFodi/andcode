// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import { ThemeProvider } from "@/contexts/ThemeContext";

// Load Inter font
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'AndCode - Master Coding Challenges',
  description: 'Level up your programming skills with interactive coding challenges and real-world problems',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
        <ThemeProvider>
          <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] dark:bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <Navbar />
          <main className="relative z-10">
            {children}
          </main>
          <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <div className="max-w-7xl mx-auto">
              <p>© {new Date().getFullYear()} AndCode. Level up your coding skills with confidence.</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}