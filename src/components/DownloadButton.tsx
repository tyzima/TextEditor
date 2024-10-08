import React, { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { fabric } from 'fabric';

interface DownloadButtonProps {
  canvas: fabric.Canvas | null;
  textLines: { text: string }[];
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ canvas, textLines }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDownload = (format: 'svg' | 'png') => {
    if (canvas) {
      if (format === 'svg') {
        const svg = canvas.toSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const firstLineText = textLines[0]?.text || 'logo';
        const fileName = `${firstLineText}_ShirtGen.svg`;
        
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'png') {
        const dataURL = canvas.toDataURL({
          format: 'png',
          quality: 1
        });
        const link = document.createElement('a');
        link.href = dataURL;
        
        const firstLineText = textLines[0]?.text || 'logo';
        const fileName = `${firstLineText}_ShirtGen.png`;
        
        link.download = fileName;
        link.click();
      }
    }
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowDropdown(true)}
        onMouseLeave={() => setShowDropdown(false)}
        className="flex-1 bg-white text-green-600 border border-green-300 py-2 px-4 rounded-lg hover:bg-green-600 hover:text-white transition duration-300 flex items-center justify-center shadow-sm"
      >
        <Download className="mr-2" size={20} />
        Download
        <ChevronDown className="ml-2" size={16} />
      </button>
      {showDropdown && (
        <div 
          className="absolute right-0 w-24 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              onClick={() => handleDownload('svg')}
              className="block px-4 py-2 text-sm text-green-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
              role="menuitem"
            >
              as .SVG
            </button>
            <button
              onClick={() => handleDownload('png')}
              className="block px-4 py-2 text-sm text-green-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
              role="menuitem"
            >
              as .PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadButton;
