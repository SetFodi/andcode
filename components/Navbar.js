'use client';
// components/Navbar.js
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl">
              LeetCode Clone
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/problems" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  Problems
                </Link>
                <Link href="/contests" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  Contests
                </Link>
                <Link href="/discuss" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  Discuss
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center">
              {user ? (
                <>
                  <Link href="/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/problems" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
            Problems
          </Link>
          <Link href="/contests" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
            Contests
          </Link>
          <Link href="/discuss" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
            Discuss
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-700">
          <div className="px-2 space-y-1">
            {user ? (
              <>
                <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 hover:bg-blue-700 mx-2 text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}