import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { Plus, AlignCenter, Upload } from 'lucide-react';
import DownloadButton from './DownloadButton';

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  handleFileDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  centerAllObjects: () => void;
  addTextLine: () => void;
  canvas: fabric.Canvas | null;
  textLines: { text: string }[];
  canvasOpacity: number;
  handleKeyDown: (e: KeyboardEvent) => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  canvasRef,
  handleFileDrop,
  handleFileInputChange,
  centerAllObjects,
  addTextLine,
  canvas,
  textLines,
  canvasOpacity,
  handleKeyDown,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.tabIndex = 0; // Make the container focusable
      container.addEventListener('keydown', handleKeyDown);
      return () => {
        container.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown]);

  return (
    <div className="w-full md:w-1/2 mb-8 md:mb-0">
      <div 
        ref={containerRef}
        className="bg-gray-100 rounded-lg shadow-inner p-4 focus:outline-none"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
      >
        <div className="aspect-square relative">
          <div 
            style={{
              opacity: canvasOpacity,
              transition: 'opacity 0.2s ease-in-out'
            }}
          >
            <canvas 
              ref={canvasRef} 
              className="w-full h-full"
            ></canvas>
          </div>
          <div className="absolute top-2 left-2 flex space-x-2">
            <label 
              className="bg-white text-blue-600 p-2 rounded-lg hover:bg-primary-50 transition duration-300 flex items-center justify-center cursor-pointer shadow-sm border border-primary group"
              title="Upload SVG"
            >
              <Upload size={20} className="group-hover:scale-110 transition-transform duration-300" />
              <input 
                type="file" 
                accept=".svg" 
                className="hidden" 
                onChange={handleFileInputChange}
              />
            </label>
            <button
              onClick={centerAllObjects}
              className="bg-white text-blue-600 p-2 rounded-lg hover:bg-primary-50 transition duration-300 flex items-center justify-center shadow-sm border border-primary group"
              title="Center All Objects"
            >
              <AlignCenter size={20} className="group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={addTextLine}
            className="flex-1 bg-white text-blue-600 border border-blue-300 py-2 px-4 rounded-lg hover:bg-blue-600 hover:text-white transition duration-300 flex items-center justify-center shadow-sm"
          >
            <Plus className="mr-2" size={20} />
            Add Text
          </button>
          <DownloadButton canvas={canvas} textLines={textLines} />
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;
