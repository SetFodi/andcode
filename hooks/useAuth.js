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

  const checkUserSession = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { "Content-Type": "application/json" }
      });
      
      console.log("checkUserSession response:", res.status);
      if (res.ok) {
        const userData = await res.json();
        console.log("User data from /me:", userData);
        setUser(userData.user);
      } else {
        console.log("No valid session, status:", res.status);
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const userData = await res.json();
      console.log("Login successful, user:", userData.user);
      setUser(userData.user);
      return true; // Let SignInForm handle redirect
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

  return { user, login, logout, loading };
};