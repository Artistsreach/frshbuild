"use client";

import { useState, useEffect } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

const Stars = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 50; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          duration: Math.random() * 2 + 1,
          delay: Math.random() * 2,
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: '2px',
            height: '2px',
            animation: `twinkle ${star.duration}s linear ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default Stars;
