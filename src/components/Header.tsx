import React from 'react';
import { Mail } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sportsIcons } from '../constants';
import confetti from 'canvas-confetti';

// Add this new interface for AnimatedSportsIcon props
interface AnimatedSportsIconProps {
  onAnimationComplete?: () => void;
}

const AnimatedSportsIcon: React.FC<AnimatedSportsIconProps> = ({ onAnimationComplete }) => {
  const [currentIconIndex, setCurrentIconIndex] = React.useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = React.useState(false);

  React.useEffect(() => {
    if (isAnimationComplete) return;

    const interval = setInterval(() => {
      setCurrentIconIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex === sportsIcons.length - 1) {
          setIsAnimationComplete(true);
          clearInterval(interval);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }
        return nextIndex;
      });
    }, 3000); // Change icon every 3 seconds

    return () => clearInterval(interval);
  }, [isAnimationComplete, onAnimationComplete]);

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

    const Header: React.FC = () => {  const triggerConfetti = () => {
    const end = Date.now() + (3 * 1000); // 3 seconds from now

    const colors = ['#4299E1', '#667EEA']; // Blue and Indigo colors

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleClick = () => {
    triggerConfetti();
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 rounded-b-3xl relative z-10">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <h1 
          className="text-3xl font-bold text-primary flex items-center cursor-pointer"
          onClick={handleClick}
        >
          <AnimatedSportsIcon />
          ShirtGen
        </h1>
        <a 
          href="mailto:ty@bespokegoods.co" 
          className="text-primary hover:text-blue-800 transition-colors duration-300"
          title="Contact Us"
        >
          <Mail size={24} />
        </a>
      </div>
    </header>
  );
};

export default Header;
