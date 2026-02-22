import { useState, useRef } from 'react';
import { Monitor, Smartphone, Move } from 'lucide-react';

interface CropArea {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage
  height: number; // percentage
}

interface ImageCropSelectorProps {
  imageUrl: string;
  desktopCrop: CropArea;
  mobileCrop: CropArea;
  onDesktopCropChange: (crop: CropArea) => void;
  onMobileCropChange: (crop: CropArea) => void;
}

export function ImageCropSelector({
  imageUrl,
  desktopCrop,
  mobileCrop,
  onDesktopCropChange,
  onMobileCropChange,
}: ImageCropSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'desktop' | 'mobile' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeFrame, setActiveFrame] = useState<'desktop' | 'mobile'>('desktop');

  // Handle mouse/touch down
  function handlePointerDown(
    e: React.PointerEvent,
    frame: 'desktop' | 'mobile'
  ) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(frame);
    setActiveFrame(frame);
    setDragStart({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  // Handle mouse/touch move
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate movement as percentage of container
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    const crop = dragging === 'desktop' ? desktopCrop : mobileCrop;
    const setCrop = dragging === 'desktop' ? onDesktopCropChange : onMobileCropChange;

    // Calculate new position with bounds
    let newX = crop.x + deltaX;
    let newY = crop.y + deltaY;

    // Constrain to container
    newX = Math.max(0, Math.min(100 - crop.width, newX));
    newY = Math.max(0, Math.min(100 - crop.height, newY));

    setCrop({
      ...crop,
      x: newX,
      y: newY,
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }

  // Handle mouse/touch up
  function handlePointerUp(e: React.PointerEvent) {
    if (dragging) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDragging(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Frame Toggle Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveFrame('desktop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFrame === 'desktop'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-sand-100 text-sage-600 border-2 border-transparent hover:bg-sand-200'
          }`}
        >
          <Monitor className="w-4 h-4" />
          Desktop
        </button>
        <button
          onClick={() => setActiveFrame('mobile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFrame === 'mobile'
              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
              : 'bg-sand-100 text-sage-600 border-2 border-transparent hover:bg-sand-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Handy
        </button>
      </div>

      {/* Image Container with Crop Frames */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] bg-sand-200 rounded-xl overflow-hidden select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Background Image */}
        <img
          src={imageUrl}
          alt="Hero Bild"
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* Darkened overlay outside crop areas */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Desktop Frame (blue) */}
        <div
          className={`absolute border-2 rounded-lg cursor-move transition-shadow ${
            activeFrame === 'desktop' 
              ? 'border-blue-500 shadow-lg shadow-blue-500/30 z-20' 
              : 'border-blue-400/60 z-10'
          }`}
          style={{
            left: `${desktopCrop.x}%`,
            top: `${desktopCrop.y}%`,
            width: `${desktopCrop.width}%`,
            height: `${desktopCrop.height}%`,
          }}
          onPointerDown={(e) => handlePointerDown(e, 'desktop')}
        >
          {/* Clear area inside frame */}
          <div 
            className="absolute inset-0 overflow-hidden rounded-md"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${100 / desktopCrop.width * 100}% ${100 / desktopCrop.height * 100}%`,
              backgroundPosition: `${-desktopCrop.x / desktopCrop.width * 100}% ${-desktopCrop.y / desktopCrop.height * 100}%`,
            }}
          />
          
          {/* Label */}
          <div className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
            activeFrame === 'desktop' ? 'bg-blue-500 text-white' : 'bg-blue-400/60 text-white/80'
          }`}>
            <Monitor className="w-3 h-3 inline mr-1" />
            Desktop
          </div>

          {/* Move indicator */}
          {activeFrame === 'desktop' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 rounded-full p-2 shadow-lg">
                <Move className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Frame (green) */}
        <div
          className={`absolute border-2 rounded-lg cursor-move transition-shadow ${
            activeFrame === 'mobile' 
              ? 'border-emerald-500 shadow-lg shadow-emerald-500/30 z-20' 
              : 'border-emerald-400/60 z-10'
          }`}
          style={{
            left: `${mobileCrop.x}%`,
            top: `${mobileCrop.y}%`,
            width: `${mobileCrop.width}%`,
            height: `${mobileCrop.height}%`,
          }}
          onPointerDown={(e) => handlePointerDown(e, 'mobile')}
        >
          {/* Clear area inside frame */}
          <div 
            className="absolute inset-0 overflow-hidden rounded-md"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${100 / mobileCrop.width * 100}% ${100 / mobileCrop.height * 100}%`,
              backgroundPosition: `${-mobileCrop.x / mobileCrop.width * 100}% ${-mobileCrop.y / mobileCrop.height * 100}%`,
            }}
          />
          
          {/* Label */}
          <div className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
            activeFrame === 'mobile' ? 'bg-emerald-500 text-white' : 'bg-emerald-400/60 text-white/80'
          }`}>
            <Smartphone className="w-3 h-3 inline mr-1" />
            Handy
          </div>

          {/* Move indicator */}
          {activeFrame === 'mobile' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 rounded-full p-2 shadow-lg">
                <Move className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Desktop Preview */}
        <div>
          <p className="text-sm font-medium text-sage-600 mb-2 flex items-center gap-1">
            <Monitor className="w-4 h-4" />
            Desktop Vorschau
          </p>
          <div 
            className="aspect-video rounded-lg overflow-hidden bg-sand-200 border-2 border-blue-200"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${100 / desktopCrop.width * 100}% ${100 / desktopCrop.height * 100}%`,
              backgroundPosition: `${desktopCrop.x / (100 - desktopCrop.width) * 100}% ${desktopCrop.y / (100 - desktopCrop.height) * 100}%`,
            }}
          />
        </div>

        {/* Mobile Preview */}
        <div>
          <p className="text-sm font-medium text-sage-600 mb-2 flex items-center gap-1">
            <Smartphone className="w-4 h-4" />
            Handy Vorschau
          </p>
          <div 
            className="aspect-[9/16] max-h-[200px] mx-auto rounded-lg overflow-hidden bg-sand-200 border-2 border-emerald-200"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${100 / mobileCrop.width * 100}% ${100 / mobileCrop.height * 100}%`,
              backgroundPosition: `${mobileCrop.x / (100 - mobileCrop.width) * 100}% ${mobileCrop.y / (100 - mobileCrop.height) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Help text */}
      <p className="text-sm text-sage-400">
        💡 Ziehe die Rahmen um den Bildausschnitt für Desktop und Handy festzulegen. Die Rahmen können sich überlappen.
      </p>
    </div>
  );
}
