"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firebaseFunctions } from '../lib/firebaseFunctions';

interface CreditsDisplayProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  position?: 'fixed' | 'inline';
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ 
  className = "", 
  showIcon = true, 
  size = 'md',
  position = 'inline'
}) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues by only running logic after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (user) {
      // Get initial credits
      const getInitialCredits = async () => {
        try {
          setLoading(true);
          const userCredits = await firebaseFunctions.getUserCredits();
          setCredits(userCredits);
        } catch (error) {
          console.error('Error getting credits:', error);
          setCredits(0);
        } finally {
          setLoading(false);
        }
      };

      getInitialCredits();

      // Set up polling for real-time updates (since we can't use onSnapshot with Functions)
      const interval = setInterval(async () => {
        try {
          const userCredits = await firebaseFunctions.getUserCredits();
          setCredits(userCredits);
        } catch (error) {
          console.error('Error updating credits:', error);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    } else {
      setCredits(0);
      setLoading(false);
    }
  }, [user, mounted]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const positionClasses = {
    fixed: 'fixed top-4 right-4 bg-white dark:bg-neutral-800 p-2 rounded-full shadow-lg z-50',
    inline: ''
  };

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${positionClasses[position]} ${className}`}>
        {showIcon && <span className={`${iconSizes[size]} text-yellow-500 animate-pulse`}>💰</span>}
        <span className={`${sizeClasses[size]} animate-pulse`}>...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${positionClasses[position]} ${className}`}>
      {showIcon && <span className={`${iconSizes[size]} text-yellow-500`}>💰</span>}
      <span className={`font-bold ${sizeClasses[size]}`}>
        {credits.toLocaleString()}
      </span>
    </div>
  );
};

export default CreditsDisplay;
