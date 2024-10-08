import React from 'react';
import { DotPattern } from './DotPattern';

const BackgroundPattern: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className="text-primary opacity-50 absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
      />
    </div>
  );
};

export default BackgroundPattern;