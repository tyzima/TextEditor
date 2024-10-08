import React, { useState } from 'react';
import { TextLine } from '../types';
import { Trash2 } from 'lucide-react';

interface TextLineComponentProps {
  line: TextLine;
  isSelected: boolean;
  onSelect: () => void;
  updateTextLine: (id: string, field: keyof TextLine, value: string | number) => void;
  removeTextLine: (id: string) => void;
  isFirstLine: boolean;
}

const TextLineComponent: React.FC<TextLineComponentProps> = ({
  line,
  isSelected,
  onSelect,
  updateTextLine,
  removeTextLine,
  isFirstLine
}) => {
  const [localText, setLocalText] = useState(line.text);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateTextLine(line.id, 'text', localText);
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-md transition duration-300 overflow-hidden mb-4 ${
        isSelected ? 'ring-2 ring-primary bg-primary-50' : ''
      }`}
    >
      <div className="flex items-center space-x-4 p-4">
        <div className="flex-grow relative">
          <input
            type="text"
            value={localText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={onSelect}
            className={`w-full p-2 pr-8 border rounded-lg transition duration-300 ${
              isSelected 
                ? 'border-primary focus:ring-2 focus:ring-primary focus:border-primary' 
                : 'border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
            }`}
            placeholder="Enter text"
          />
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
            ↵
          </span>
        </div>
        {!isFirstLine && (
          <button
            onClick={() => removeTextLine(line.id)}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 shadow-sm hover:shadow-md"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(TextLineComponent);
