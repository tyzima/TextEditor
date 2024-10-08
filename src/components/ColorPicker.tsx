import React, { memo } from 'react';
import { ColorPickerProps } from '../types';

const ColorPicker: React.FC<ColorPickerProps> = ({ colors, selectedColor, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Color</h3>
        <div className="grid grid-cols-5 gap-3 mb-6">
          {colors.map((color) => (
            <div key={color.value} className="relative group">
              <button
                className={`w-10 h-10 rounded-full transition duration-300 ${selectedColor === color.value ? 'ring-4 ring-offset-2 ring-primary' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => onSelect(color.value)}
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {color.name}
              </div>
            </div>
          ))}
        </div>
        <button
          className="w-full bg-primary-dark text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default memo(ColorPicker);
