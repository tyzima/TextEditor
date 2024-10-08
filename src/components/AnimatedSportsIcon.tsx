import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sportsIcons } from '../../constants';

export const AnimatedSportsIcon: React.FC = () => {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    if (isAnimationComplete) return;

    const interval = setInterval(() => {
      setCurrentIconIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex === sportsIcons.length - 1) {
          setIsAnimationComplete(true);
          clearInterval(interval);
        }
        return nextIndex;
      });
    }, 3000); // Change icon every 3 seconds

    return () => clearInterval(interval);
  }, [isAnimationComplete]);

  return (
    <div className="relative w-8 h-8 mr-2 overflow-hidden">
      {sportsIcons.map((icon, index) => (
        <FontAwesomeIcon
          key={index}
          icon={icon}
          className={`absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out ${
            index === currentIconIndex
              ? 'translate-x-0 opacity-100'
              : index === (currentIconIndex - 1 + sportsIcons.length) % sportsIcons.length
              ? '-translate-x-full opacity-0'
              : 'translate-x-full opacity-0'
          }`}
        />
      ))}
    </div>
  );
};