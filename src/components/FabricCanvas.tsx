import { useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage } from 'fabric';

export interface FabricCanvasProps {
  width: number;
  height: number;
}

export const FabricCanvas = ({ width, height }: FabricCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

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

    if (!imgUrl) return;

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
    if (!imgUrl) {
      console.error('No image URL provided');
      return;
    }
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
    <canvas ref={canvasRef} className='border border-[var(--color-text)] rounded-xl'/>
  )
}
