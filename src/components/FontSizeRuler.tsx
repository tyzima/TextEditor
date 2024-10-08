import React from 'react';

interface FontSizeRulerProps {
  value: number;
  onChange: (value: number) => void;
  options: number[];
}

const FontSizeRuler: React.FC<FontSizeRulerProps> = ({ value, onChange, options }) => {
  const minSize = Math.min(...options);
  const maxSize = Math.max(...options);

  return (
    <div className="relative w-full h-11 bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full flex items-end">
        {options.map((size) => (
          <div
            key={size}
            className="flex-1 h-full flex flex-col items-center justify-end cursor-pointer group"
            onClick={() => onChange(size)}
          >
            <span className="text-xs mb-1 group-hover:text-blue-600 transition-colors duration-200">
              {size}
            </span>
            <div
              className={`w-0.5 group-hover:bg-blue-400 transition-all duration-200 ${
                value >= size ? 'bg-primary' : 'bg-gray-400'
              }`}
              style={{ height: '40%' }}
            />
          </div>
        ))}
      </div>
      <div
        className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300"
        style={{ 
          width: `${((value - minSize) / (maxSize - minSize)) * 100}%`,
          right: value === maxSize ? '0' : 'auto'
        }}
      />
    </div>
  );
};

export default FontSizeRuler;