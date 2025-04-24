// app/layout.js
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from 'framer-motion';

// Load multiple fonts for better typography
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'AndCode - Master Coding Challenges',
  description: 'Level up your programming skills with interactive coding challenges and real-world problems',
  keywords: 'coding, programming, challenges, algorithms, interview prep',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
        <div className="fixed inset-0 bg-[url(/grid-pattern-light.svg)] dark:bg-[url(/grid-pattern-dark.svg)] opacity-[0.03] pointer-events-none z-0"></div>
        <ThemeProvider>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <Navbar />
              <main className="relative z-10">
                {children}
              </main>
              <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <div className="max-w-7xl mx-auto">
                  <p>© {new Date().getFullYear()} AndCode. Level up your coding skills with confidence.</p>
                </div>
              </footer>
            </motion.div>
          </AnimatePresence>
        </ThemeProvider>
      </body>
    </html>
  );
}