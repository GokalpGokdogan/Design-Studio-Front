import React, { useState, useRef, useCallback, useEffect } from 'react';
import DesignCanvas from './DesignCanvas';

const InfiniteCanvas = ({ designs = [], onDesignsUpdate, onDesignSelect, selectedDesignId: externalSelectedDesignId }) => {
  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const selectedDesignRef = useRef(null);
  
  // Canvas state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [internalSelectedDesignId, setInternalSelectedDesignId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Use external selectedDesignId if provided, otherwise use internal state
  const selectedDesignId = externalSelectedDesignId !== undefined ? externalSelectedDesignId : internalSelectedDesignId;

  // Spacing constants
  const DESIGN_SPACING = 80; 
  const MARGIN_SPACING = 100; 

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX, screenY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    return {
      x: (screenX - rect.left - transform.x) / transform.scale,
      y: (screenY - rect.top - transform.y) / transform.scale
    };
  }, [transform]);

  // Handle design selection
  const handleDesignClick = useCallback((e, design) => {
    e.stopPropagation();
    
    const newSelectedId = design.id === selectedDesignId ? null : design.id;
    
    // Update internal state if not controlled externally
    if (externalSelectedDesignId === undefined) {
      setInternalSelectedDesignId(newSelectedId);
    }
    
    // Call external handler if provided
    onDesignSelect?.(newSelectedId);
    
    // Set as current selected design for dragging
    if (newSelectedId) {
      selectedDesignRef.current = design;
    } else {
      selectedDesignRef.current = null;
    }
  }, [selectedDesignId, externalSelectedDesignId, onDesignSelect]);

  // Handle mouse down - start dragging canvas or design
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    
    // Check if clicked on a design
    let clickedDesign = null;
    for (const design of designs) {
      const { x, y, width, height } = design.position;
      const selectionBuffer = 5;
      if (canvasPos.x >= x - selectionBuffer && canvasPos.x <= x + width + selectionBuffer &&
          canvasPos.y >= y - selectionBuffer && canvasPos.y <= y + height + selectionBuffer) {
        clickedDesign = design;
        break;
      }
    }

    if (clickedDesign) {
      // Select the design if not already selected
      if (clickedDesign.id !== selectedDesignId) {
        const newSelectedId = clickedDesign.id;
        
        // Update internal state if not controlled externally
        if (externalSelectedDesignId === undefined) {
          setInternalSelectedDesignId(newSelectedId);
        }
        
        // Call external handler if provided
        onDesignSelect?.(newSelectedId);
      }
      
      selectedDesignRef.current = clickedDesign;
      setDragOffset({
        x: canvasPos.x - clickedDesign.position.x,
        y: canvasPos.y - clickedDesign.position.y
      });
    } else {
      // Clicked on empty space - deselect
      if (selectedDesignId) {
        // Update internal state if not controlled externally
        if (externalSelectedDesignId === undefined) {
          setInternalSelectedDesignId(null);
        }
        
        // Call external handler if provided
        onDesignSelect?.(null);
      }
      selectedDesignRef.current = null;
    }

    isDraggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [designs, screenToCanvas, selectedDesignId, externalSelectedDesignId, onDesignSelect]);

  // Handle mouse move - drag canvas or design
  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - lastPosRef.current.x;
    const deltaY = e.clientY - lastPosRef.current.y;

    if (selectedDesignRef.current) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const newPosition = {
        ...selectedDesignRef.current.position,
        x: canvasPos.x - dragOffset.x,
        y: canvasPos.y - dragOffset.y
      };

      const updatedDesigns = designs.map(design =>
        design.id === selectedDesignRef.current.id
          ? { ...design, position: newPosition }
          : design
      );
      
      onDesignsUpdate?.(updatedDesigns);
    } else {
      setTransform(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    }

    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, [designs, screenToCanvas, dragOffset, onDesignsUpdate]);

  // Handle mouse up - stop dragging
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    selectedDesignRef.current = null;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // Handle wheel - zoom in/out
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(transform.scale * scaleFactor, 0.1), 5);
    
    if (newScale === transform.scale) return;

    const scaleRatio = newScale / transform.scale;
    setTransform(prev => ({
      scale: newScale,
      x: mouseX - (mouseX - prev.x) * scaleRatio,
      y: mouseY - (mouseY - prev.y) * scaleRatio
    }));
  }, [transform]);

  // Calculate optimal position for new design with proper spacing
  const calculateNewDesignPosition = useCallback(() => {
    if (designs.length === 0) {
      return { x: MARGIN_SPACING, y: MARGIN_SPACING };
    }

    // Find the rightmost design
    const rightmostDesign = designs.reduce((rightmost, design) => {
      const rightEdge = design.position.x + design.position.width;
      return rightEdge > rightmost.rightEdge 
        ? { design, rightEdge } 
        : rightmost;
    }, { design: designs[0], rightEdge: designs[0].position.x + designs[0].position.width });

    return {
      x: rightmostDesign.rightEdge + DESIGN_SPACING,
      y: rightmostDesign.design.position.y
    };
  }, [designs]);

  // Add design to canvas with proper spacing
  const addDesign = useCallback((designData, position) => {
    const newPosition = position || calculateNewDesignPosition();
    
    const newDesign = {
      id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: designData,
      position: {
        x: newPosition.x,
        y: newPosition.y,
        width: designData?.artboard?.width || 800,
        height: designData?.artboard?.height || 600
      },
      timestamp: Date.now()
    };
    
    onDesignsUpdate?.([...designs, newDesign]);
    
    return newDesign.id;
  }, [designs, onDesignsUpdate, calculateNewDesignPosition]);

  // Remove design from canvas
  const removeDesign = useCallback((designId) => {
    const updatedDesigns = designs.filter(design => design.id !== designId);
    onDesignsUpdate?.(updatedDesigns);
    if (selectedDesignId === designId) {
      setSelectedDesignId(null);
    }
  }, [designs, selectedDesignId, onDesignsUpdate]);

  // Auto-arrange designs with consistent spacing
  const autoArrangeDesigns = useCallback(() => {
    if (designs.length === 0) return;

    const arrangedDesigns = designs.map((design, index) => {
      const newX = MARGIN_SPACING + (index * (design.position.width + DESIGN_SPACING));
      return {
        ...design,
        position: {
          ...design.position,
          x: newX,
          y: MARGIN_SPACING
        }
      };
    });

    onDesignsUpdate?.(arrangedDesigns);
  }, [designs, onDesignsUpdate]);

  // Center view on all designs with padding
  const centerView = useCallback(() => {
    if (designs.length === 0) {
      setTransform({ x: 0, y: 0, scale: 1 });
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    designs.forEach(design => {
      const { x, y, width, height } = design.position;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    const padding = DESIGN_SPACING;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const boundingWidth = maxX - minX;
    const boundingHeight = maxY - minY;
    const centerX = minX + boundingWidth / 2;
    const centerY = minY + boundingHeight / 2;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasWidth = rect.width;
    const canvasHeight = rect.height;
    
    const scaleX = (canvasWidth - 100) / boundingWidth;
    const scaleY = (canvasHeight - 100) / boundingHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    setTransform({
      scale,
      x: canvasWidth / 2 - centerX * scale,
      y: canvasHeight / 2 - centerY * scale
    });
  }, [designs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Reset
      if (e.key === 'r' || e.key === 'R') {
        setTransform({ x: 0, y: 0, scale: 1 });
      }
      // Center
      if (e.key === 'c' || e.key === 'C') {
        centerView();
      }
      // Auto-arrange
      if (e.key === 'a' || e.key === 'A') {
        autoArrangeDesigns();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDesignId, removeDesign, centerView, autoArrangeDesigns]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Attach wheel event with passive: false
    const wheelHandler = (e) => handleWheel(e);
    canvas.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', wheelHandler, { passive: false });
    };
  }, [handleWheel]);

    return {
    canvasComponent: (
      <div 
        ref={canvasRef}
        className="w-full h-full overflow-hidden bg-gray-50 cursor-grab active:cursor-grabbing relative"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)
          `,
          backgroundSize: `${20 * transform.scale}px ${20 * transform.scale}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px`
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Canvas content */}
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
        >
          {designs.map((design) => (
            <div
              key={design.id}
              className={`absolute border-2 rounded-lg overflow-hidden transition-all ${
                selectedDesignId === design.id 
                  ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{
                left: `${design.position.x}px`,
                top: `${design.position.y}px`,
                width: `${design.position.width}px`,
                height: `${design.position.height}px`,
                cursor: selectedDesignId === design.id ? 'grabbing' : 'grab'
              }}
              onMouseDown={(e) => handleDesignClick(e, design)}
            >
              {/* Design header */}
              <div className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {design.data?.meta?.title || `Design ${design.id.slice(-4)}`}
                  {selectedDesignId === design.id && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">(Selected)</span>
                  )}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDesign(design.id);
                    
                    if (selectedDesignId === design.id) {
                      if (externalSelectedDesignId === undefined) {
                        setInternalSelectedDesignId(null);
                      }
                      onDesignSelect?.(null);
                    }
                  }}
                  className="text-gray-400 hover:text-red-500 text-xs"
                >
                  x
                </button>
              </div>
              
              {/* Design content */}
              <div className="bg-white" style={{ 
                height: `${design.position.height - 40}px`,
                overflow: 'hidden'
              }}>
                <div style={{ 
                  transform: `scale(${Math.min(
                    (design.position.width - 20) / (design.data?.artboard?.width || 800),
                    (design.position.height - 60) / (design.data?.artboard?.height || 600)
                  )})`,
                  transformOrigin: 'top left',
                  margin: '10px'
                }}>
                  <DesignCanvas designData={design.data} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Canvas controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 text-gray-600">
          <button
            onClick={autoArrangeDesigns}
            className="px-3 py-1 bg-white rounded-md shadow-sm border text-sm hover:bg-gray-50"
            title="Auto-arrange designs (A)"
          >
            Arrange
          </button>
          <button
            onClick={centerView}
            className="px-3 py-1 bg-white rounded-md shadow-sm border text-sm hover:bg-gray-50"
            title="Center view (C)"
          >
            Center
          </button>
          <button
            onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
            className="px-3 py-1 bg-white rounded-md shadow-sm border text-sm hover:bg-gray-50"
            title="Reset view (R)"
          >
            Reset
          </button>
        </div>

        {/* Canvas info */}
        <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-sm border px-3 py-1 text-sm text-gray-600 z-10">
          Zoom: {Math.round(transform.scale * 100)}% | Designs: {designs.length}
          {selectedDesignId && " | Selected: " + selectedDesignId.slice(-4)}
        </div>
      </div>
    ),
    addDesign,
    removeDesign,
    centerView,
    autoArrangeDesigns,
    transform,
    selectedDesignId: externalSelectedDesignId !== undefined ? externalSelectedDesignId : internalSelectedDesignId
  };
};

export default InfiniteCanvas;