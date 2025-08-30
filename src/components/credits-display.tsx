"use client";

import React, { useState, useEffect } from 'react';
import { useFirebaseAuthContext } from './firebase-auth-provider';
import { listenToCredits, getCredits } from '@/lib/firestore';

interface CreditsDisplayProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CreditsDisplay({ 
  className = "", 
  showIcon = true, 
  size = 'md' 
}: CreditsDisplayProps) {
  const { user } = useFirebaseAuthContext();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCredits(0);
      setLoading(false);
      return;
    }

    // Get initial credits
    const getInitialCredits = async () => {
      try {
        const initialCredits = await getCredits(user.uid);
        setCredits(initialCredits);
      } catch (error) {
        console.error('Error getting initial credits:', error);
        setCredits(0);
      } finally {
        setLoading(false);
      }
    };

    getInitialCredits();

    // Listen to real-time updates
    const unsubscribe = listenToCredits(user.uid, (newCredits) => {
      setCredits(newCredits);
    });

    return () => unsubscribe();
  }, [user]);

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

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <span className={`${iconSizes[size]} animate-pulse`}>💰</span>}
        <span className={`${sizeClasses[size]} animate-pulse`}>...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <span className={iconSizes[size]}>💰</span>}
      <span className={`font-bold ${sizeClasses[size]}`}>
        {credits.toLocaleString()}
      </span>
    </div>
  );
}

export default CreditsDisplay;
