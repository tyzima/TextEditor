import { fabric } from 'fabric';

export type TextLine = {
  id: string;
  text: string;
  font: string;
  fontSize: number;
  color: string;
  borderColor: string;
  borderWidth: number;
  x: number;
  y: number;
  letterSpacing: 'None' | 'S' | 'L';
};

export interface ColorPickerProps {
  colors: { name: string; value: string }[];
  selectedColor: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

export interface SVGColors {
  fill: string[];
  stroke: string[];
}

export interface UploadedSVG {
  id: string;
  name: string;
  svgString: string;
  object: fabric.Object;
  colors: SVGColors;
  position: { left: number; top: number };
  scale: { scaleX: number; scaleY: number };
}

export interface TemplateData {
  id: string;
  name: string;
  tags: string[];
  content: {
    canvasJSON: CanvasData;
    textLines: TextLine[];
    svgData: {
      id: string;
      name: string;
      svgString: string;
      colors: SVGColors;
      position: { left: number; top: number };
      scale: { scaleX: number; scaleY: number };
    }[];
  };
}

export interface CanvasData {
  objects: Array<{ type: string; properties: Record<string, unknown> }>;
  background?: string;
}
