"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Sun, 
  Moon, 
  Code, 
  User, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  BookOpen
} from "lucide-react";

export default function Navbar() {
  const auth = useAuth();
  const { user, logout, loading } = auth || { user: null, logout: () => {}, loading: true };
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    closeMenus();
    await logout();
    router.push('/auth/signin');
  };

  const isActive = (path) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Loading state with subtle animation
  if (loading) {
    return (
      <nav className="bg-gray-800 text-white dark:bg-gray-900 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl">AndCode</div>
          <div className="animate-pulse flex space-x-4">
            <div className="h-2 w-12 bg-gray-600 rounded"></div>
            <div className="h-2 w-12 bg-gray-600 rounded"></div>
            <div className="h-2 w-12 bg-gray-600 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-gray-800 text-white dark:bg-gray-900 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Main Navigation */}
            <div className="flex items-center">
              <Link href="/" className="font-bold text-xl flex items-center gap-2" onClick={closeMenus}>
                <Code className="w-6 h-6 text-blue-500" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  AndCode
                </span>
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-1">
                  <Link 
                    href="/problems" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/problems') 
                        ? 'bg-gray-700 dark:bg-gray-700 text-white' 
                        : 'hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                    onClick={closeMenus}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Problems
                    </div>
                  </Link>
                  <Link 
                    href="/forum" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/forum') 
                        ? 'bg-gray-700 dark:bg-gray-700 text-white' 
                        : 'hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                    onClick={closeMenus}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Forum
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* User Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center">
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.username} 
                          className="w-7 h-7 rounded-full mr-2 border-2 border-blue-500" 
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2">
                          <span className="text-white text-xs font-bold">
                            {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                          </span>
                        </div>
                      )}
                      <span className="max-w-[100px] truncate">{user.username}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
                      <Link 
                        href={`/profile/${user._id}`} 
                        className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        onClick={closeMenus}
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/auth/signin" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 hover:text-white transition-colors"
                    onClick={closeMenus}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white transition-colors"
                    onClick={closeMenus}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none"
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden z-20`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/problems"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/problems') 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } flex items-center gap-2`}
              onClick={closeMenus}
            >
              <BookOpen className="w-5 h-5" />
              Problems
            </Link>
            <Link 
              href="/forum"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/forum') 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } flex items-center gap-2`}
              onClick={closeMenus}
            >
              <MessageSquare className="w-5 h-5" />
              Forum
            </Link>
          </div>

          {/* User Section */}
          <div className="pt-4 pb-3 border-t border-gray-700 dark:border-gray-600">
            {user && (
              <div className="flex items-center px-4 py-2">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.username} 
                    className="w-10 h-10 rounded-full border-2 border-blue-500" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                )}
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user.username}</div>
                  <div className="text-sm font-medium text-gray-400">{user.email}</div>
                </div>
              </div>
            )}

            <div className="px-2 space-y-1 mt-2">
              {user ? (
                <>
                  <Link 
                    href={`/profile/${user._id}`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
                    onClick={closeMenus}
                  >
                    <User className="w-5 h-5" />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Log Out
                  </button>
                </>
              ) : (
                <div className="space-y-2 px-2">
                  <Link 
                    href="/auth/signin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full text-center"
                    onClick={closeMenus}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors w-full text-center"
                    onClick={closeMenus}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              
              <button
                onClick={toggleTheme}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2 mt-3"
              >
                {theme === "light" ? (
                  <>
                    <Moon className="w-5 h-5" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="w-5 h-5" />
                    Light Mode
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* This div adds spacing to prevent navbar from covering content */}
      <div className="h-16"></div>
    </>
  );
}