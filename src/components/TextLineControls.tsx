import React, { memo } from 'react';
import { TextLine } from '../types';
import { Palette } from 'lucide-react';
import FontSelector from './FontSelector';
import FontSizeRuler from './FontSizeRuler';

interface TextLineControlsProps {
  line: TextLine;
  updateTextLine: (id: string, field: keyof TextLine, value: string | number) => void;
  setShowColorPicker: (value: { id: string; type: 'text' | 'border' } | null) => void;
  isFontLoading: boolean;
  fonts: { name: string; url: string }[];
  fontSizeOptions: number[];
  borderWidthOptions: number[];
}

const TextLineControls: React.FC<TextLineControlsProps> = ({
  line,
  updateTextLine,
  setShowColorPicker,
  isFontLoading,
  fonts,
  fontSizeOptions,
  borderWidthOptions,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font
          </label>
          <FontSelector
            fonts={fonts}
            selectedFont={line.font}
            onSelect={(font) => updateTextLine(line.id, 'font', font)}
            isLoading={isFontLoading}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Size
          </label>
          <div className="relative pt-1">
            <FontSizeRuler
              value={line.fontSize}
              onChange={(newSize) => updateTextLine(line.id, 'fontSize', newSize)}
              options={fontSizeOptions}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Color
          </label>
          <button
            className="w-full p-2 border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50 transition duration-300"
            onClick={() => setShowColorPicker({ id: line.id, type: 'text' })}
          >
            <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: line.color }}></div>
            <Palette size={16} className="text-gray-500" />
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Border Color
          </label>
          <button
            className="w-full p-2 border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50 transition duration-300"
            onClick={() => setShowColorPicker({ id: line.id, type: 'border' })}
          >
            <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: line.borderColor }}></div>
            <Palette size={16} className="text-gray-500" />
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Border Width
          </label>
          <div className="flex space-x-2">
            {borderWidthOptions.map((width) => (
              <button
                key={width}
                onClick={() => updateTextLine(line.id, 'borderWidth', width)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition duration-300 ${
                  line.borderWidth === width
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {width}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Letter Spacing
        </label>
        <div className="flex space-x-4 w-full">
          {['None', 'S', 'L'].map((spacing) => (
            <button
              key={spacing}
              onClick={() => updateTextLine(line.id, 'letterSpacing', spacing as 'None' | 'S' | 'L')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition duration-300 flex items-center justify-center ${
                line.letterSpacing === spacing
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg font-black" style={{ letterSpacing: spacing === 'L' ? '0.9em' : (spacing === 'S' ? '0.2em' : 'normal') }}>
                 ABC
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(TextLineControls);
