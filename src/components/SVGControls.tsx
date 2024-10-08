import React from 'react';
import { UploadedSVG } from '../types';
import { Pencil, MoveUp, MoveDown, Trash2 } from 'lucide-react';

interface SVGControlsProps {
  uploadedSvgs: UploadedSVG[];
  selectedSvgId: string | null;
  setSelectedSvgId: (id: string | null) => void;
  handleLogoNameChange: (id: string, newName: string) => void;
  moveSelectedObjectToFront: () => void;
  moveSelectedObjectToBack: () => void;
  removeSVG: (id: string) => void;
  showSVGColorPicker: boolean;
  setShowSVGColorPicker: (show: boolean) => void;
  selectedSVGColor: string | null;
  setSelectedSVGColor: (color: string | null) => void;
  handleSVGColorChange: (newColor: string) => void;
}

const SVGControls: React.FC<SVGControlsProps> = ({
  uploadedSvgs,
  selectedSvgId,
  setSelectedSvgId,
  handleLogoNameChange,
  moveSelectedObjectToFront,
  moveSelectedObjectToBack,
  removeSVG,
  setShowSVGColorPicker,
  selectedSVGColor,
  setSelectedSVGColor,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
        Graphics
      </h2>
      <div className="space-y-2">
        {uploadedSvgs.map((svg) => (
          <div key={svg.id} className="flex items-center justify-between bg-white p-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedSvgId(svg.id)}
                className={`p-2 rounded-lg ${selectedSvgId === svg.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                {svg.name}
              </button>
              <button
                onClick={() => {
                  const newName = prompt('Enter new name for the logo:', svg.name);
                  if (newName) handleLogoNameChange(svg.id, newName);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition duration-300"
              >
                <Pencil size={16} />
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={moveSelectedObjectToFront}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition duration-300"
                title="Move to Front"
              >
                <MoveUp size={16} />
              </button>
              <button
                onClick={moveSelectedObjectToBack}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition duration-300"
                title="Move to Back"
              >
                <MoveDown size={16} />
              </button>
              <button
                onClick={() => removeSVG(svg.id)}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition duration-300"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedSvgId && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">SVG Colors</h2>
          <div className="flex flex-wrap gap-2">
            {uploadedSvgs.find(svg => svg.id === selectedSvgId)?.colors.fill.concat(
              uploadedSvgs.find(svg => svg.id === selectedSvgId)?.colors.stroke || []
            ).map((color, index) => (
              <button
                key={index}
                className={`w-8 h-8 rounded-full shadow-sm transition duration-300 ${
                  selectedSVGColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setSelectedSVGColor(color);
                  setShowSVGColorPicker(true);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SVGControls);
