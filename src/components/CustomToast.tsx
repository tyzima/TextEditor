import React from 'react';
import { Save } from 'lucide-react';

interface CustomToastProps {
  t: {
    visible: boolean;
  };
  message: string;
  description: string;
}

const CustomToast: React.FC<CustomToastProps> = ({ t, message, description }) => {
  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white bg-opacity-20 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      style={{
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex-1 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Save className="h-10 w-10 text-green-500" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {message}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomToast;