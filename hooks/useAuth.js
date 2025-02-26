// hooks/useAuth.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUserSession();
  }, []);

  // In your useAuth.js
const checkUserSession = async () => {
  try {
    console.log("useAuth: Checking user session");
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: { "Content-Type": "application/json" }
    });
    
    console.log("useAuth: Session check response:", res.status);
    
    if (res.ok) {
      const userData = await res.json();
      console.log("useAuth: User data from session:", userData);
      
      if (userData.user && userData.user._id) {
        console.log("useAuth: Valid user found in session");
        setUser(userData.user);
      } else {
        console.log("useAuth: No valid user in response:", userData);
        setUser(null);
      }
    } else {
      console.log("useAuth: No valid session, status:", res.status);
      setUser(null);
    }
  } catch (error) {
    console.error('useAuth: Session check error:', error);
    setUser(null);
  } finally {
    setLoading(false);
  }
};

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Login failed, response:", errorText);
        throw new Error("Login failed");
      }
      
      const userData = await res.json();
      console.log("Login successful, user:", userData.user);
      setUser(userData.user); // Immediately update state
      await checkUserSession(); // Double-check session to ensure sync
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error('Logout failed');
      console.log("Logout successful");
      setUser(null);
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { user, login, logout, loading, checkUserSession }; // Expose checkUserSession for manual refresh
};