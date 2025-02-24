'use client'
// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // For testing only - to simulate an authenticated user
  // Remove this in production
  useEffect(() => {
    // Simulated timeout to represent API call
    const timer = setTimeout(() => {
      // Simulate a logged-in user
      setUser({
        _id: "67bc7198f743e23d730480d7",
        userId: "67bc7198f743e23d730480d7",
        email: "demo@example.com",
        username: "DemoUser"
      });
      setLoading(false);
      console.log("AuthProvider: Simulated user login complete");
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  /* Uncomment this for production use
  useEffect(() => {
    // Check for user session on component mount
    console.log("AuthProvider: Checking user session");
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      console.log("AuthProvider: Fetching user session");
      // Make an API call to check the user's session
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Important for cookies
      });
      
      console.log("AuthProvider: User session response", res.status);
      
      if (res.ok) {
        const userData = await res.json();
        console.log("AuthProvider: User data retrieved", userData);
        setUser(userData);
      } else {
        console.log("AuthProvider: No valid session found");
        setUser(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("AuthProvider: Attempting login", email);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookies
      });
      
      console.log("AuthProvider: Login response", res.status);
      
      if (!res.ok) {
        const error = await res.json();
        console.error("AuthProvider: Login failed", error);
        throw new Error(error.message || 'Login failed');
      }
      
      const userData = await res.json();
      console.log("AuthProvider: Login successful", userData);
      
      setUser(userData.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("AuthProvider: Logging out");
      // Call logout API to clear the cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      console.log("AuthProvider: Logged out, clearing user data");
      setUser(null);
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  */

  // Simplified login function for testing
  const login = async (email, password) => {
    try {
      console.log("AuthProvider: Simulating login for", email);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser = {
        _id: "67bc7198f743e23d730480d7",
        userId: "67bc7198f743e23d730480d7",
        email: email,
        username: email.split('@')[0]
      };
      
      setUser(mockUser);
      console.log("AuthProvider: Login successful", mockUser);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  // Simplified logout function for testing
  const logout = async () => {
    console.log("AuthProvider: Logging out");
    setUser(null);
    router.push('/auth/signin');
  };

  console.log("AuthProvider: Current state", { user, loading });

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);