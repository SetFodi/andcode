// components/Navbar.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
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
  BookOpen,
  Bell,
  Settings,
  Award,
  Github,
  Search,
  Terminal
} from "lucide-react";

export default function Navbar() {
  const { user, logout, loading, checkUserSession } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      checkUserSession();
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, user, checkUserSession]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsSearchOpen(false);
  };

  const handleLogout = async () => {
    closeMenus();
    await logout();
    router.push('/auth/signin');
  };

  const isActive = (path) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40">
        <div className={`transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm z-10 border-b border-gray-200 dark:border-gray-800`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 h-8 w-8 rounded-lg flex items-center justify-center animate-pulse">
                <Code className="text-white w-5 h-5" />
              </div>
              <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">AndCode</div>
            </div>
            <div className="animate-pulse flex space-x-4">
              <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40">
        <motion.nav 
          className={`transition-all duration-300 ${
            isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-md' : 'bg-white dark:bg-gray-900'
          } z-10 border-b border-gray-200 dark:border-gray-800`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="font-bold text-xl flex items-center gap-2 group" onClick={closeMenus}>
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-8 w-8 rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-md group-hover:shadow-lg">
                    <Code className="text-white w-5 h-5" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 font-heading">
                    AndCode
                  </span>
                </Link>
                <div className="hidden md:block ml-10">
                  <div className="flex items-center space-x-2">
                    {[
                      { name: "Problems", path: "/problems", icon: <BookOpen className="w-4 h-4" /> },
                      { name: "Forum", path: "/forum", icon: <MessageSquare className="w-4 h-4" /> },
                    ].map((item) => (
                      <Link 
                        key={item.path}
                        href={item.path} 
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive(item.path) 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        onClick={closeMenus}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          {item.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-3">
                {/* Search Button */}
                <button
                  onClick={toggleSearch}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 relative"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors relative"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={theme}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </motion.div>
                  </AnimatePresence>
                </button>

                {/* GitHub Link */}
                <a 
                  href="https://github.com/andcode/coding-challenges" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <Github className="w-5 h-5" />
                </a>

                {user ? (
                  <div className="relative">
                    <button
                      onClick={toggleProfileMenu}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center">
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.username} 
                            className="w-8 h-8 rounded-full object-cover border-2 border-blue-500 shadow-sm" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-bold">
                              {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                            </span>
                          </div>
                        )}
                        <span className="max-w-[120px] truncate ml-2 font-medium text-gray-700 dark:text-gray-300">
                          {user.username}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
                        >
                          <div className="p-2 divide-y divide-gray-100 dark:divide-gray-700">
                            <div className="py-2">
                              <Link 
                                href={`/profile/${user._id}`} 
                                className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                onClick={closeMenus}
                              >
                                <User className="w-4 h-4 mr-3 text-gray-500 group-hover:text-blue-500 transition-colors" />
                                My Profile
                              </Link>
                              <Link 
                                href="/settings" 
                                className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                onClick={closeMenus}
                              >
                                <Settings className="w-4 h-4 mr-3 text-gray-500 group-hover:text-blue-500 transition-colors" />
                                Settings
                              </Link>
                              <Link 
                                href="/notifications" 
                                className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                onClick={closeMenus}
                              >
                                <Bell className="w-4 h-4 mr-3 text-gray-500 group-hover:text-blue-500 transition-colors" />
                                Notifications
                              </Link>
                            </div>
                            <div className="py-2">
                              <button
                                onClick={handleLogout}
                                className="group flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-colors"
                              >
                                <LogOut className="w-4 h-4 mr-3 text-red-500 group-hover:text-red-600 transition-colors" />
                                Log Out
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link 
                      href="/auth/signin" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                      onClick={closeMenus}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5"
                      onClick={closeMenus}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              <div className="md:hidden flex items-center gap-3">
                <button
                  onClick={toggleSearch}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                  aria-expanded={isMenuOpen}
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isSearchOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Search problems, concepts, or users..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                      autoFocus
                    />
                    <button 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Try searching for "dynamic programming", "binary tree", or "sorting algorithms"
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3 max-h-[70vh] overflow-y-auto">
                  {[
                    { name: "Problems", path: "/problems", icon: <BookOpen className="w-5 h-5" /> },
                    { name: "Forum", path: "/forum", icon: <MessageSquare className="w-5 h-5" /> },
                  ].map((item) => (
                    <Link 
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                        isActive(item.path) 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      onClick={closeMenus}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                  {user && (
                    <div className="flex items-center px-4 py-2">
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.username} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow-sm" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <span className="text-white text-base font-bold">
                            {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                          </span>
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800 dark:text-white">{user.username}</div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  )}

                  <div className="px-2 space-y-1 mt-3">
                    {user ? (
                      <>
                        <Link 
                          href={`/profile/${user._id}`}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                          onClick={closeMenus}
                        >
                          <User className="w-5 h-5" />
                          My Profile
                        </Link>
                        <Link 
                          href="/settings"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                          onClick={closeMenus}
                        >
                          <Settings className="w-5 h-5" />
                          Settings
                        </Link>
                        <Link 
                          href="/notifications"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                          onClick={closeMenus}
                        >
                          <Bell className="w-5 h-5" />
                          Notifications
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors w-full text-left"
                        >
                          <LogOut className="w-5 h-5" />
                          Log Out
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2 px-2">
                        <Link 
                          href="/auth/signin"
                          className="flex justify-center items-center gap-2 px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors w-full"
                          onClick={closeMenus}
                        >
                          Sign In
                        </Link>
                        <Link 
                          href="/auth/signup"
                          className="flex justify-center items-center gap-2 px-3 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all w-full"
                          onClick={closeMenus}
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
      
      <div className="h-16"></div>
    </>
  );
}