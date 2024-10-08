import React, { useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { TemplateData, TextLine } from '../types';

interface TemplateThumbnailProps {
  template: TemplateData;
  textLines: TextLine[];
  onThumbnailGenerated: (id: string, dataUrl: string) => void;
}

const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({ template, textLines, onThumbnailGenerated }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateThumbnail = useCallback(() => {
    if (canvasRef.current) {
      const thumbnailCanvas = canvasRef.current;
      thumbnailCanvas.width = 100;
      thumbnailCanvas.height = 100;
      const thumbnailFabric = new fabric.StaticCanvas(thumbnailCanvas);

      thumbnailFabric.loadFromJSON(template.content.canvasJSON, () => {
        template.content.textLines.forEach((line, index) => {
          const currentLine = textLines[index] || line;
          const textObject = thumbnailFabric.getObjects().find(obj => 'id' in obj && obj.id === line.id) as fabric.Text;
          if (textObject) {
            textObject.set({
              text: currentLine.text,
              fill: currentLine.color,
              stroke: currentLine.borderColor,
              strokeWidth: currentLine.borderWidth
            });
          }
        });

        thumbnailFabric.setZoom(thumbnailFabric.getZoom() * 0.2);
        thumbnailFabric.setDimensions({
          width: 100,
          height: 100
        });
        thumbnailFabric.renderAll();

        const dataUrl = thumbnailCanvas.toDataURL();
        onThumbnailGenerated(template.id, dataUrl);

        thumbnailFabric.dispose();
      });
    }
  }, [template, textLines, onThumbnailGenerated]);

  useEffect(() => {
    generateThumbnail();
  }, [generateThumbnail]);

  return <canvas ref={canvasRef} style={{ display: 'none' }} />;
};

export default React.memo(TemplateThumbnail);