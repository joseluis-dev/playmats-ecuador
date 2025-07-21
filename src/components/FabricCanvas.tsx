import { useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage } from 'fabric';

export interface FabricCanvasProps {
  width: number;
  height: number;
}

export const FabricCanvas = ({ width, height }: FabricCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [imgUrl, setImgUrl] = useState<string>('https://res.cloudinary.com/dcxt2wrcm/image/upload/w_1668,h_938,f_auto,c_lfill/v1745801198/Playmat-Vitral-de-Tierras_uklbn7.webp');

  useEffect(() => {
    if (!canvasRef.current) return;
    // Dispose previous canvas if exists
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }
    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
    });
    fabricCanvasRef.current = canvas;

    FabricImage.fromURL(imgUrl).then((img) => {
      if (img && fabricCanvasRef.current) {
        // Escalar imagen si excede el canvas
        const maxWidth = fabricCanvasRef.current.width;
        const maxHeight = fabricCanvasRef.current.height;
        let scale = 1;
        if (img.width > maxWidth || img.height > maxHeight) {
          scale = Math.min(maxWidth / img.width, maxHeight / img.height);
          img.scale(scale);
        }
        fabricCanvasRef.current?.add(img);
        fabricCanvasRef.current?.setActiveObject(img);
        fabricCanvasRef.current?.renderAll();
        console.log('Image added to canvas');
      } else {
        console.error('Failed to load image');
      }
    });

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  const handleAddImage = () => {
    if (!fabricCanvasRef.current) return;
    FabricImage.fromURL(imgUrl).then((img) => {
      if (img && fabricCanvasRef.current) {
        // Escalar imagen si excede el canvas
        const maxWidth = fabricCanvasRef.current.width;
        const maxHeight = fabricCanvasRef.current.height;
        let scale = 1;
        if (img.width > maxWidth || img.height > maxHeight) {
          scale = Math.min(maxWidth / img.width, maxHeight / img.height);
          img.scale(scale);
        }
        fabricCanvasRef.current?.add(img);
        fabricCanvasRef.current?.setActiveObject(img);
        fabricCanvasRef.current?.renderAll();
        console.log('Image added to canvas');
      } else {
        console.error('Failed to load image');
      }
    });
  }

  return (
    <div>
      <canvas ref={canvasRef} className='border border-[var(--color-text)] rounded-xl'/>
    </div>
  )
}
