// app/layout.js
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';
import Navbar from '../components/Navbar';
import { ThemeProvider } from "@/contexts/ThemeContext";
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AndCode - Coding Challenges',
  description: 'Practice coding problems and improve your skills',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}