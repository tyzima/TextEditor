import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { fabric } from 'fabric'
import opentype from 'opentype.js'
import * as makerjs from 'makerjs'
import { Type } from 'lucide-react'
import tinycolor from 'tinycolor2'
import { createClient } from '@supabase/supabase-js'
import debounce from 'lodash/debounce'
import { Toaster, toast } from 'react-hot-toast'
import { fonts, presetColors } from './constants';
import { UploadedSVG, TemplateData } from './types';
import TextLineComponent from './components/TextLineComponent';
import SVGControls from './components/SVGControls';
import TemplateSection from './components/TemplateSection';
import TextLineControls from './components/TextLineControls';
import CanvasArea from './components/CanvasArea';
import CustomToast from './components/CustomToast';
import TemplateThumbnail from './components/TemplateThumbnail';
import { Font } from 'opentype.js';
import ColorPicker from './components/ColorPicker';





declare module 'fabric' {
  interface Object {
    id?: string;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

import Header from './components/Header';

import Footer from './components/Footer';

import BackgroundPattern from './components/BackgroundPattern';




type TextLine = {
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

// Add this near the top of your file, after other imports
const fontCache: { [key: string]: opentype.Font } = {};

// Add this new function to apply letter spacing
const applyLetterSpacing = (text: string, spacing: 'None' | 'S' | 'L'): string => {
  if (spacing === 'None') return text;
  const spacer = spacing === 'S' ? ' ' : '  '; // 1 space for S, 2 spaces for L
  return text.split('').join(spacer);
};



function App() {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [textLines, setTextLines] = useState<TextLine[]>([
    { id: '1', text: 'TEAMNAME', font: fonts[0].name, fontSize: 80, color: presetColors[0].value, borderColor: '#000000', borderWidth: 0, x: 250, y: 150, letterSpacing: 'None' }
  ])
  const [showColorPicker, setShowColorPicker] = useState<{ id: string, type: 'text' | 'border' } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedSVGColor, setSelectedSVGColor] = useState<string | null>(null);

  // Update this line in your existing code
  const fontSizeOptions = useMemo(() => [40, 50, 60, 70, 80, 90, 100, 110, 120, 200], []);
  
  // Add this new line
  const borderWidthOptions = useMemo(() => [0, 6, 8, 10, 12], []);

  // Replace the single uploadedSvg state with an array
  const [uploadedSvgs, setUploadedSvgs] = useState<UploadedSVG[]>([])
  
  // Add a new state for the currently selected SVG
  const [selectedSvgId, setSelectedSvgId] = useState<string | null>(null)

  // Add this new state for SVG color picker
  const [showSVGColorPicker, setShowSVGColorPicker] = useState<boolean>(false);

  // Update the templates state to include full template data
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [selectedTemplate] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState('')

  // Add this new state to track if a template is currently loaded

  const [canvasOpacity, setCanvasOpacity] = useState(1);

  // Add this near the top of your component, after the state declarations
  const debouncedUpdateLogo = useMemo(
    () => debounce(() => {
      if (canvas) {
        canvas.renderAll();
      }
    }, 100),
    [canvas]
  );

  // Add a new state for tags
  const [templateTags, setTemplateTags] = useState<string[]>([]);

  // Add these new state variables in the App component
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Add this new state to track the selected text line
  const [selectedTextLineId, setSelectedTextLineId] = useState<string | null>('1');

  // In the App component, add a new state for font loading
  const [isFontLoading, setIsFontLoading] = useState(true);

  const [templateThumbnails, setTemplateThumbnails] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (canvasRef.current) {
      const container = canvasRef.current.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = containerWidth; // Make it a square

        const newCanvas = new fabric.Canvas(canvasRef.current, {
          width: containerWidth,
          height: containerHeight,
          backgroundColor: '#ffffff',
        
        });
        setCanvas(newCanvas);

        const resizeCanvas = () => {
          const newWidth = container.clientWidth;
          const newHeight = newWidth; // Keep it square
          newCanvas.setDimensions({
            width: newWidth,
            height: newHeight,
          });
          newCanvas.renderAll();
        };

        window.addEventListener('resize', resizeCanvas);

        // Update the initial text position
        const centerPoint = {
          x: containerWidth / 2,
          y: containerHeight / 2
        };

        setTextLines(prevLines => prevLines.map(line => ({
          ...line,
          x: centerPoint.x,
          y: centerPoint.y
        })));

        // Ensure the first text line is selected
        setSelectedTextLineId('1');

        newCanvas.on('object:modified', handleObjectModified)
        newCanvas.on('mouse:up', handleMouseUp)
        
        document.addEventListener('keydown', handleKeyDown)

        return () => {
          // Cleanup function
          if (newCanvas) {
            newCanvas.off(); // Remove all event listeners
            newCanvas.dispose(); // Dispose of the canvas
            setCanvas(null); // Clear the canvas state
          }
          document.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('resize', resizeCanvas);
        };
      }
    }
  }, [])

 

  // Add this new function to extract all unique tags from templates
  const extractAllTags = useCallback((templates: TemplateData[]) => {
    const tagSet = new Set<string>();
    templates.forEach(template => {
      template.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, []);

  // Update fetchTemplates function to get full template data
  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('templates').select('*')
      if (error) throw error
      setTemplates(data || [])
      setAllTags(extractAllTags(data || []))
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }, [extractAllTags])
  
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Update the saveTemplate function
  const saveTemplate = async () => {
    if (!canvas || !templateName) return;

    const canvasJSON = canvas.toJSON(['id']);
    const svgData = uploadedSvgs.map(svg => ({
      id: svg.id,
      name: svg.name,
      svgString: svg.svgString,
      colors: svg.colors,
      position: { left: svg.object.left, top: svg.object.top },
      scale: { scaleX: svg.object.scaleX, scaleY: svg.object.scaleY }
    }));

    const content = {
      canvasJSON,
      textLines,
      svgData,
    };

    try {
      await supabase
        .from('templates')
        .insert({ name: templateName, content, tags: templateTags })

      setTemplateName('');
      setTemplateTags([]);
      fetchTemplates();
      
      toast.custom(
        (t) => (
          <CustomToast
            t={t}
            message="Template saved successfully!"
            description={`Your template has been saved with the following tags: ${templateTags.join(', ')}`}
          />
        ),
        {
          duration: 3000,
          position: 'bottom-right',
        }
      );
    } catch (error) {
      console.error('Error saving template:', error);
      
      toast.error('Failed to save template. Please try again.', {
        position: 'bottom-right',
        style: {
          background: 'rgba(239, 68, 68, 0.7)',
          color: '#fff',
          backdropFilter: 'blur(10px)',
        },
        duration: 3000,
      });
    }
  };

  // Update the loadTemplate function
  const loadTemplate = async (templateId: string) => {
    if (canvas) {
      canvas.clear();
    }

    const { data, error } = await supabase
      .from('templates')
      .select('content')
      .eq('id', templateId)
      .single()

    if (error) {
      console.error('Error loading template:', error)
    } else if (data && data.content) {
      const { canvasJSON, textLines: savedTextLines, svgData } = data.content

      canvas?.loadFromJSON(canvasJSON, async () => {
        // Load SVGs
        const loadedSvgs: UploadedSVG[] = []
        for (const svgItem of svgData) {
          await new Promise<void>((resolve) => {
            fabric.loadSVGFromString(svgItem.svgString, (objects, options) => {
              const svgObject = fabric.util.groupSVGElements(objects, options)
              svgObject.set({
                name: svgItem.id,
                left: svgItem.position.left,
                top: svgItem.position.top,
                scaleX: svgItem.scale.scaleX,
                scaleY: svgItem.scale.scaleY,
                objectCaching: false,
              })
              canvas.add(svgObject)
              
              loadedSvgs.push({
                id: svgItem.id,
                name: svgItem.name,
                svgString: svgItem.svgString,
                object: svgObject,
                colors: svgItem.colors,
                position: svgItem.position,
                scale: svgItem.scale
              })
              resolve()
            })
          })
        }

        setUploadedSvgs(loadedSvgs)

        // Merge existing text, font color, and border color with template text
        const mergedTextLines = savedTextLines.map((savedLine: TextLine, index: number) => {
          const existingLine = textLines[index];
          if (existingLine) {
            return {
              ...savedLine,
              text: existingLine.text || savedLine.text,
              color: existingLine.color || savedLine.color,
              borderColor: existingLine.borderColor || savedLine.borderColor
            };
          }
          return savedLine;
        });

        setTextLines(mergedTextLines)

        // Update the canvas objects with the saved text lines
        canvas.getObjects().forEach((obj) => {
          if (obj.type === 'group' && (obj as fabric.Object).name) {
            const textLine = savedTextLines.find((line: TextLine) => line.id === (obj as fabric.Object).name);
            if (textLine) {
              const textObject = (obj as fabric.Group).getObjects().find(o => o.type === 'text') as fabric.Text;
              if (textObject) {
                textObject.set({
                  text: textLine.text,
                  fill: textLine.color,
                  stroke: textLine.borderColor,
                  strokeWidth: textLine.borderWidth,
                  fontFamily: textLine.font,
                  fontSize: textLine.fontSize,
                  charSpacing: textLine.letterSpacing === 'S' ? 100 : (textLine.letterSpacing === 'L' ? 200 : 0)
                });
              }
            }
          }
        });

        // Center the template horizontally
        centerTemplateHorizontally();

        canvas.renderAll()
        
        // Set the first SVG as selected if there are any
        if (loadedSvgs.length > 0) {
          setSelectedSvgId(loadedSvgs[0].id)
        }
      })
    }
  }

  // Add this new function to center the template horizontally
  const centerTemplateHorizontally = () => {
    if (canvas) {
      const objects = canvas.getObjects();
      if (objects.length === 0) return;

      const canvasCenter = canvas.getCenter();
      const group = new fabric.Group(objects);
      const groupCenter = group.getCenterPoint();

      const deltaX = canvasCenter.left - groupCenter.x;

      objects.forEach(obj => {
        obj.set({
          left: (obj.left || 0) + deltaX
        });
        obj.setCoords();
      });

      // Ungroup after centering
      group.destroy();
      canvas.renderAll();

      // Update text lines state
      setTextLines(prevLines => prevLines.map(line => {
        const obj = canvas.getObjects().find(o => (o as fabric.Object & { id?: string }).id === line.id) as fabric.Object;
        if (obj) {
          const center = obj.getCenterPoint();  // Change this line
          return {
            ...line,
            x: Math.round(center.x),
            y: Math.round(center.y),
          };
        }
        return line;
      }));
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const STEP = 1; // pixels to move

    switch (e.key) {
      case 'ArrowUp':
        activeObject.top! -= STEP;
        break;
      case 'ArrowDown':
        activeObject.top! += STEP;
        break;
      case 'ArrowLeft':
        activeObject.left! -= STEP;
        break;
      case 'ArrowRight':
        activeObject.left! += STEP;
        break;
      default:
        return; // Exit the function for other keys
    }

    activeObject.setCoords();
    canvas.renderAll();
    updateObjectPosition(activeObject);
    e.preventDefault(); // Prevent default scrolling behavior
  }, [canvas]);

  const updateObjectPosition = useCallback((object: fabric.Object) => {
    if (object.name) {
      setTextLines(prevLines => prevLines.map(line => {
        if (line.id === object.name) {
          return {
            ...line,
            x: Math.round(object.left! + (object.width! || 0) / 2),
            y: Math.round(object.top! + (object.height! || 0) / 2),
          };
        }
        return line;
      }));
    } else if (selectedSvgId) {
      setUploadedSvgs(prevSvgs => prevSvgs.map(svg => {
        if (svg.id === selectedSvgId) {
          return {
            ...svg,
            position: { left: object.left!, top: object.top! },
          };
        }
        return svg;
      }));
    }
  }, [selectedSvgId]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);


  // Update the handleObjectModified function
  const handleObjectModified = useCallback((e: fabric.IEvent) => {
    const target = e.target as fabric.Object & { id?: string };
    if (target && target.id) {
      setTextLines(prevLines => prevLines.map(line => {
        if (line.id === target.id) {
          const center = target.getCenterPoint();
          return {
            ...line,
            x: Math.round(center.x),
            y: Math.round(center.y),
          };
        }
        return line;
      }));
    }
    debouncedUpdateLogo();
  }, [debouncedUpdateLogo]);

  // Update the handleMouseUp function
  const handleMouseUp = useCallback((e: fabric.IEvent) => {
    const target = e.target as fabric.Object & { id?: string };
    if (target && target.id) {
      setTextLines(prevLines => prevLines.map(line => {
        if (line.id === target.id) {
          const center = target.getCenterPoint();
          return {
            ...line,
            x: Math.round(center.x),
            y: Math.round(center.y),
          };
        }
        return line;
      }));
    }
    debouncedUpdateLogo();
  }, [debouncedUpdateLogo]);



  // Update the updateLogo function
  const updateLogo = useCallback(() => {
    if (!canvas) return;

    setCanvasOpacity(0);

    const updateCanvasObjects = async () => {
      // Store existing text objects' positions
      const existingTextPositions = new Map();
      canvas.getObjects().forEach(obj => {
        if (obj.type === 'group' && (obj as fabric.Object).name) {
          existingTextPositions.set((obj as fabric.Object).name, {
            left: obj.left,
            top: obj.top
          });
        }
      });

      // Remove all existing objects
      canvas.clear();

      // Render text lines
      for (const line of textLines) {
        const font = fonts.find(f => f.name === line.font);
        if (!font) continue;

        try {
          let loadedFont: opentype.Font;
          if (fontCache[font.name]) {
            loadedFont = fontCache[font.name];
          } else {
            loadedFont = await new Promise((resolve, reject) => {
              opentype.load(font.url, (err, font) => {
                if (err) {
                  console.error(`Error loading font ${font?.names.fontFamily?.en ?? 'Unknown'}:`, err);
                } else if (font) {
                  const fontName = font.names.fontFamily.en || Object.values(font.names.fontFamily)[0];
                  fontCache[fontName] = font;
                  resolve(font);
                } else {
                  reject(new Error('Font is undefined'));
                }
              });
            });
          }

          // Apply letter spacing to the text
          const spacedText = applyLetterSpacing(line.text, line.letterSpacing);

          const textModel = new makerjs.models.Text(loadedFont, spacedText, line.fontSize);
          
          // Create the bordered text
          const borderedSvgOptions: makerjs.exporter.ISVGRenderOptions = {
            fill: line.color,
            stroke: line.borderColor,
            strokeWidth: line.borderWidth.toString(),
          }
          const borderedSvgModel = makerjs.exporter.toSVG(textModel, borderedSvgOptions)
          
          // Create the borderless text
          const borderlessSvgOptions: makerjs.exporter.ISVGRenderOptions = {
            fill: line.color,
            stroke: 'none',
          }
          const borderlessSvgModel = makerjs.exporter.toSVG(textModel, borderlessSvgOptions)
          
          // Load both SVGs
          fabric.loadSVGFromString(borderedSvgModel, (borderedObjects, borderedOptions) => {
            fabric.loadSVGFromString(borderlessSvgModel, (borderlessObjects, borderlessOptions) => {
              const borderedText = fabric.util.groupSVGElements(borderedObjects, borderedOptions)
              const borderlessText = fabric.util.groupSVGElements(borderlessObjects, borderlessOptions)
              
              // Group the bordered and borderless text
              const group = new fabric.Group([borderedText, borderlessText], {
                left: existingTextPositions.get(line.id)?.left ?? line.x,
                top: existingTextPositions.get(line.id)?.top ?? line.y,
                originX: 'center',
                originY: 'center',
                name: line.id,
                selectable: true,
                evented: true,
                hasControls: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                hasBorders: false,
                objectCaching: false,
              })

              // Add custom move cursor
              group.hoverCursor = 'move'
              group.moveCursor = 'move'

              canvas.add(group)
            })
          })
        } catch (error) {
          console.error('Error loading font:', error)
        }
      }

      // Render uploaded SVGs
      uploadedSvgs.forEach((svg) => {
        svg.object.set('objectCaching', false);
        canvas.add(svg.object);
      });

      canvas.renderAll();
      setCanvasOpacity(1);
    };

    updateCanvasObjects();
  }, [canvas, textLines, uploadedSvgs, fonts]);

  useEffect(() => {
    if (canvas) {
      updateLogo();
    }
  }, [canvas, updateLogo]);


  // Update the addTextLine function
  const addTextLine = () => {
    const newId = (textLines.length + 1).toString();
    const centerPoint = { x: 238, y: 200 };
    const lastLine = textLines[textLines.length - 1];
    const newY = lastLine ? lastLine.y + 60 : centerPoint.y;

    const newLine: TextLine = { 
      id: newId, 
      text: 'ATHLETICS', 
      font: fonts[0].name, 
      fontSize: 80,
      color: presetColors[0].value, 
      borderColor: '#000000', 
      borderWidth: 0, 
      x: centerPoint.x, 
      y: newY,
      letterSpacing: 'None'  // Changed from 'Normal' to 'None'
    };

    setTextLines(prevLines => [...prevLines, newLine]);
    
  };

  // Update the updateTextLine function to handle the new border width
  const updateTextLine = useCallback((id: string, field: keyof TextLine, value: string | number) => {
    setTextLines(prevLines => 
      prevLines.map(line => {
        if (line.id === id) {
          if (field === 'fontSize') {
            const closestSize = fontSizeOptions.reduce((prev, curr) => 
              Math.abs(curr - Number(value)) < Math.abs(prev - Number(value)) ? curr : prev
            );
            return { ...line, [field]: closestSize };
          }
          if (field === 'borderWidth') {
            const newValue = borderWidthOptions.includes(Number(value)) ? Number(value) : line.borderWidth;
            return { ...line, [field]: newValue };
          }
          return { ...line, [field]: value };
        }
        return line;
      })
    );

    // Only trigger full update for these fields
    const fieldsRequiringFullUpdate = ['text', 'font', 'fontSize', 'color', 'borderColor', 'borderWidth', 'letterSpacing'];
    if (fieldsRequiringFullUpdate.includes(field as string)) {
      updateLogo();
    } else if (canvas) {
      // For other fields (like position), just update the canvas
      const textObject = canvas.getObjects().find(obj => obj.name === id) as fabric.Group;
      if (textObject) {
        textObject.set(field as any, value);
        canvas.renderAll();
      }
    }
  }, [fontSizeOptions, borderWidthOptions, updateLogo, canvas]);

  const removeTextLine = (id: string) => {
    setTextLines(prevLines => prevLines.filter(line => line.id !== id))
  }

  const handleColorSelect = (id: string, type: 'text' | 'border', color: string) => {
    updateTextLine(id, type === 'text' ? 'color' : 'borderColor', color)
    setShowColorPicker(null)
  }

  // Add this new function to calculate the scale factor
  const calculateScaleFactor = (svgWidth: number, svgHeight: number, maxWidth: number, maxHeight: number) => {
    const widthRatio = maxWidth / svgWidth;
    const heightRatio = maxHeight / svgHeight;
    return Math.min(widthRatio, heightRatio, 1) * 0.8; // 0.8 to leave some margin
  }

  // Update handleSVGLoad function
  const handleSVGLoad = (svgString: string) => {
    setCanvasOpacity(0); // Fade out

    setTimeout(() => {
      fabric.loadSVGFromString(svgString, (objects, options) => {
        const svgObject = fabric.util.groupSVGElements(objects, options);
        const scaleFactor = calculateScaleFactor(svgObject.width!, svgObject.height!, 400, 200);
        svgObject.set({
          left: 250,
          top: 150,
          scaleX: scaleFactor,
          scaleY: scaleFactor,
          objectCaching: false,
        });
        const newSvgId = Date.now().toString();
        const colors = extractColorsFromSVG(svgString);
        const newSvgName = `Logo ${uploadedSvgs.length + 1}`;
        setUploadedSvgs(prevSvgs => [...prevSvgs, { 
          id: newSvgId, 
          name: newSvgName, 
          svgString,
          object: svgObject, 
          colors,
          position: { left: svgObject.left!, top: svgObject.top! },
          scale: { scaleX: svgObject.scaleX!, scaleY: svgObject.scaleY! }
        }]);
        setSelectedSvgId(newSvgId);
        if (canvas) {
          canvas.add(svgObject);
          canvas.renderAll();
        }

        setTimeout(() => {
          setCanvasOpacity(1); // Fade in
        }, 50);
      });
    }, 200);
  };



  type SVGColors = {
    fill: string[];
    stroke: string[];
  };
  // Update extractColorsFromSVG function to return colors instead of setting state
  const extractColorsFromSVG = (svgString: string): SVGColors => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const elements = svgDoc.getElementsByTagName('*');
    const colors: { fill: string[], stroke: string[] } = { fill: [], stroke: [] };

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const fill = element.getAttribute('fill');
      const stroke = element.getAttribute('stroke');

      if (fill && fill !== 'none') {
        const color = tinycolor(fill);
        if (color.isValid() && !colors.fill.includes(color.toHexString())) {
          colors.fill.push(color.toHexString());
        }
      }

      if (stroke && stroke !== 'none') {
        const color = tinycolor(stroke);
        if (color.isValid() && !colors.stroke.includes(color.toHexString())) {
          colors.stroke.push(color.toHexString());
        }
      }
    }

    return colors;
  };

  // Update the handleSVGColorChange function
  const handleSVGColorChange = (newColor: string) => {
    if (!canvas || !selectedSvgId || !selectedSVGColor) return;

    setUploadedSvgs(prevSvgs => prevSvgs.map(svg => {
      if (svg.id === selectedSvgId) {
        const objects = svg.object instanceof fabric.Group ? svg.object.getObjects() : [svg.object];
        objects.forEach((obj: fabric.Object) => {
          if (obj instanceof fabric.Path) {
            if (obj.fill === selectedSVGColor) {
              obj.set('fill', newColor);
            }
            if (obj.stroke === selectedSVGColor) {
              obj.set('stroke', newColor);
            }
          }
        });
        const updatedColors = {
          fill: svg.colors.fill.map(c => c === selectedSVGColor ? newColor : c),
          stroke: svg.colors.stroke.map(c => c === selectedSVGColor ? newColor : c)
        };
        
        // Update the svgString with the new colors
        const updatedSvgString = updateSvgStringColors(svg.svgString, selectedSVGColor, newColor);
        
        return { ...svg, colors: updatedColors, svgString: updatedSvgString };
      }
      return svg;
    }));

    canvas.renderAll();
    setSelectedSVGColor(newColor);
  };

  // Add a function to remove an uploaded SVG
  const removeSVG = (id: string) => {
    setUploadedSvgs(prevSvgs => prevSvgs.filter(svg => svg.id !== id));
    if (canvas) {
      const svgToRemove = canvas.getObjects().find(obj => obj.name === id);
      if (svgToRemove) {
        canvas.remove(svgToRemove);
        canvas.renderAll();
      }
    }
    if (selectedSvgId === id) {
      setSelectedSvgId(null);
    }
  };

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const svgString = event.target?.result as string;
        handleSVGLoad(svgString);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const svgString = event.target?.result as string;
        handleSVGLoad(svgString);
      };
      reader.readAsText(file);
    }
  }, []);


// Add these functions inside the App component, before the return statement
const moveSelectedObjectToBack = () => {
  if (!canvas) {
    console.error('Canvas is not initialized');
    return;
  }
  
  const activeObject = canvas.getActiveObject();
  if (!activeObject) {
    console.log('No object selected');
    return;
  }
  
  canvas.sendToBack(activeObject);
  canvas.renderAll();
  console.log('Object moved to back');
};

const moveSelectedObjectToFront = () => {
  if (!canvas) {
    console.error('Canvas is not initialized');
    return;
  }
  
  const activeObject = canvas.getActiveObject();
  if (!activeObject) {
    console.log('No object selected');
    return;
  }
  
  canvas.bringToFront(activeObject);
  canvas.renderAll();
  console.log('Object moved to front');
};


  // Add this new function to toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Modify the memoizedTemplateThumbnails to filter based on selected tags
  const memoizedTemplateThumbnails = useMemo(() => {
    const filteredTemplates = selectedTags.length > 0
      ? templates.filter(template => 
          selectedTags.every(tag => template.tags?.includes(tag))
        )
      : templates;

    return filteredTemplates.slice(0, 12).map((template) => ({
      ...template,
      thumbnail: templateThumbnails[template.id] || ''
    }));
  }, [templates, selectedTags, templateThumbnails]);

  // Add a new function to handle logo name changes
  const handleLogoNameChange = (id: string, newName: string) => {
    setUploadedSvgs(prevSvgs =>
      prevSvgs.map(svg =>
        svg.id === id ? { ...svg, name: newName } : svg
      )
    );
  };


  // Update the useEffect for preloading fonts
  useEffect(() => {
    const preloadFonts = async () => {
      setIsFontLoading(true);
      for (const font of fonts) {
        if (!fontCache[font.name]) {
          try {
            const loadedFont = await new Promise<Font>((resolve, reject) => {
              opentype.load(font.url, (err, font) => {
                if (err) reject(err);
                else resolve(font as Font);
              });
            });
            fontCache[font.name] = loadedFont;
          } catch (error) {
            console.error(`Error preloading font ${font.name}:`, error);
          }
        }
      }
      setIsFontLoading(false);
    };

    preloadFonts();
  }, []);

  // Update this function in your App component
  const centerAllObjects = () => {
    if (canvas) {
      const objects = canvas.getObjects();
      if (objects.length === 0) return;

      // Calculate the center of the canvas
      const canvasCenter = canvas.getCenter();

      // Move each object to center it horizontally
      objects.forEach(obj => {
        const objectCenter = obj.getCenterPoint();
        const deltaX = canvasCenter.left - objectCenter.x;
        obj.set({
          left: (obj.left || 0) + deltaX
        });
        obj.setCoords();
      });

      canvas.renderAll();

      // Update text lines state
      setTextLines(prevLines => prevLines.map(line => {
        const obj = canvas.getObjects().find(o => (o as fabric.Object & { id?: string }).id === line.id) as fabric.Object;
        if (obj) {
          const center = obj.getCenterPoint();
          return {
            ...line,
            x: Math.round(center.x),
            y: Math.round(center.y),
          };
        }
        return line;
      }));
    }
  };

  // Add this new helper function to update SVG string colors
  const updateSvgStringColors = (svgString: string, oldColor: string, newColor: string): string => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const elements = svgDoc.getElementsByTagName('*');

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.getAttribute('fill') === oldColor) {
        element.setAttribute('fill', newColor);
      }
      if (element.getAttribute('stroke') === oldColor) {
        element.setAttribute('stroke', newColor);
      }
    }

    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgDoc);
  };

  const handleThumbnailGenerated = useCallback((id: string, dataUrl: string) => {
    setTemplateThumbnails(prev => ({ ...prev, [id]: dataUrl }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-primary-50 flex flex-col relative">
      <BackgroundPattern />
      {/* Add Toaster component with custom styles */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'rgba(255, 255, 255, 0.7)',
            color: '#000',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
      
      <Header />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl relative z-10">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:space-x-8">
              <CanvasArea
                canvasRef={canvasRef}
                handleFileDrop={handleFileDrop}
                handleFileInputChange={handleFileInputChange}
                centerAllObjects={centerAllObjects}
                addTextLine={addTextLine}
                canvas={canvas}
                textLines={textLines}
                canvasOpacity={canvasOpacity}
                handleKeyDown={handleKeyDown}
              />
              {/* Controls Area */}
              <div className="w-full md:w-1/2 space-y-6">
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 max-h-[259px] overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                    <Type size={24} className="mr-2 text-blue-600" />
                    Add Text
                  </h2>
                  {textLines.map((line, index) => (
                    <TextLineComponent
                      key={line.id}
                      line={line}
                      isSelected={selectedTextLineId === line.id}
                      onSelect={() => setSelectedTextLineId(line.id)}
                      updateTextLine={updateTextLine}
                      removeTextLine={removeTextLine}
                      isFirstLine={index === 0}
                    />
                  ))}
                </div>

                {selectedTextLineId && (
                  <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
                    <TextLineControls
                      line={textLines.find(line => line.id === selectedTextLineId)!}
                      updateTextLine={updateTextLine}
                      setShowColorPicker={setShowColorPicker}
                      isFontLoading={isFontLoading}
                      fonts={fonts}
                      fontSizeOptions={fontSizeOptions}
                      borderWidthOptions={borderWidthOptions}
                    />
                  </div>
                )}

                {/* SVG Controls */}
                {uploadedSvgs.length > 0 && (
                  <SVGControls
                    uploadedSvgs={uploadedSvgs}
                    selectedSvgId={selectedSvgId}
                    setSelectedSvgId={setSelectedSvgId}
                    handleLogoNameChange={handleLogoNameChange}
                    moveSelectedObjectToFront={moveSelectedObjectToFront}
                    moveSelectedObjectToBack={moveSelectedObjectToBack}
                    removeSVG={removeSVG}
                    showSVGColorPicker={showSVGColorPicker}
                    setShowSVGColorPicker={setShowSVGColorPicker}
                    selectedSVGColor={selectedSVGColor}
                    setSelectedSVGColor={setSelectedSVGColor}
                    handleSVGColorChange={handleSVGColorChange}
                  />
                )}
              </div>
            </div>
          </div>

          <TemplateSection
            templateName={templateName}
            setTemplateName={setTemplateName}
            templateTags={templateTags}
            setTemplateTags={setTemplateTags}
            saveTemplate={saveTemplate}
            allTags={allTags}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
            memoizedTemplateThumbnails={memoizedTemplateThumbnails}
            selectedTemplate={selectedTemplate}
            loadTemplate={loadTemplate}
          />
        </div>
      </main>

      {templates.map((template) => (
        <TemplateThumbnail
          key={template.id}
          template={template}
          textLines={textLines}
          onThumbnailGenerated={handleThumbnailGenerated}
        />
      ))}

 
      <Footer />

      {/* Color Pickers */}
      {showColorPicker && (
        <ColorPicker
          colors={presetColors}
          selectedColor={
            showColorPicker.type === 'text'
              ? textLines.find(l => l.id === showColorPicker.id)?.color || ''
              : textLines.find(l => l.id === showColorPicker.id)?.borderColor || ''
          }
          onSelect={(color) => {
            handleColorSelect(showColorPicker.id, showColorPicker.type, color);
          }}
          onClose={() => setShowColorPicker(null)}
        />
      )}

      {showSVGColorPicker && (
        <ColorPicker
          colors={presetColors}
          selectedColor={selectedSVGColor || ''}
          onSelect={handleSVGColorChange}
          onClose={() => setShowSVGColorPicker(false)}
        />
      )}
    </div>
  )
}export default App

