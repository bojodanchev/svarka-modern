'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  username: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((username: string) => {
    const newUser = { username };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return { user, isLoggedIn: !!user, login, logout, isLoading };
}; 