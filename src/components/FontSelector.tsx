import React, { useState, useEffect, useRef } from 'react';

interface FontSelectorProps {
  fonts: { name: string; url: string }[];
  selectedFont: string;
  onSelect: (font: string) => void;
  isLoading: boolean;
}

const FontSelector: React.FC<FontSelectorProps> = ({ fonts, selectedFont, onSelect, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition duration-300 flex items-center justify-between"
      >
        {isLoading ? (
          <div className="w-24 h-6 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <span className="truncate" style={{ fontFamily: selectedFont, maxWidth: 'calc(100% - 24px)' }}>{selectedFont}</span>
        )}
        <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="fixed z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          style={{
            width: '250px',
            maxHeight: '300px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {fonts.map((font) => (
            <button
              key={font.name}
              onClick={() => {
                onSelect(font.name);
                setIsOpen(false);
              }}
              className={`w-full p-3 text-left hover:bg-gray-100 transition duration-300 ${
                selectedFont === font.name ? 'bg-blue-100' : ''
              }`}
            >
              <span className="truncate block" style={{ fontFamily: font.name }}>{font.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FontSelector;