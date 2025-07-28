import { useEffect, useRef, useState } from 'react';
import { Canvas, Control, FabricImage, util as fabricUtil } from 'fabric';
import { useFabricCanvasStore } from '@/stores/fabricCanvasStore';

export const FabricCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const { imgSrc, setImgSrc, layers, removeLayer, size } = useFabricCanvasStore()
  console.log({ imgSrc })
  // Delete icon SVG as data URL
  const deleteIcon =
    "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
  const deleteImgRef = useRef<HTMLImageElement | null>(null);

  // Load delete icon image once
  useEffect(() => {
    const img = document.createElement('img');
    img.src = deleteIcon;
    deleteImgRef.current = img;
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, {
      width: size.width,
      height: size.height,
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = canvas;

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
        setImgSrc({
          url: null,
          layer: null,
          action: null,
        })
      }
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const canvasElement = canvasRef.current;

    if (canvas && canvasElement) {
      // Ajustar dimensiones internas del canvas (backstore)
      canvas.setDimensions(
        { width: size.width, height: size.height },
        { backstoreOnly: false }
      );

      // Renderizar cambios
      canvas.renderAll();
    }
  }, [size]);

  useEffect(() => {
    if (imgSrc?.url && imgSrc?.action === 'add') {
      handleAddImage(imgSrc);
    }
  }, [imgSrc, layers]);

  // Delete handler for control
  const deleteObject = (_eventData: any, transform: any) => {
    console.log({ transform });
    const canvas = transform.target.canvas;
    removeLayer(transform.target.layer, transform.target.id);
    canvas.remove(transform.target);
    canvas.requestRenderAll();
  };

  // Render icon for control
  const renderIcon = (
    ctx: CanvasRenderingContext2D,
    left: number,
    top: number,
    _styleOverride: any,
    fabricObject: any
  ) => {
    const size = 24; // Tamaño fijo para el ícono
    const img = deleteImgRef.current;
    if (!img) return;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabricUtil?.degreesToRadians(fabricObject.angle) || 0);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
  };

  const handleAddImage = (imgSrc: Record<string, any>) => {
    if (!fabricCanvasRef.current) return;
    if (!imgSrc.url) {
      console.error('No image URL provided');
      return;
    }
    FabricImage.fromURL(imgSrc.url).then((img) => {
      if (img && fabricCanvasRef.current) {
        // Escalar imagen si excede el canvas
        const maxWidth = fabricCanvasRef.current.width;
        const maxHeight = fabricCanvasRef.current.height;
        let scale = 1;
        if (img.width > maxWidth || img.height > maxHeight) {
          scale = Math.min(maxWidth / img.width, maxHeight / img.height);
          img.scale(scale);
        }
        // Add delete control to image
        img.controls = {
          ...img.controls,
          deleteControl: new Control({
            x: 0.5,
            y: -0.5,
            offsetY: 16,
            cursorStyle: 'pointer',
            mouseUpHandler: deleteObject,
            render: renderIcon,
            // cornerSize no es necesario aquí
          })
        };
        img.set('id', imgSrc.url);
        img.set('layer', imgSrc.layer || 'default');
        fabricCanvasRef.current.add(img);
        // fabricCanvasRef.current.setActiveObject(img);
        fabricCanvasRef.current.renderAll();
        console.log('Image added to canvas');
        
        if (imgSrc.url.startsWith('blob:')) {
          // Si es un blob, liberar memoria
          URL.revokeObjectURL(imgSrc.url);
          console.log('Blob URL revoked');
        }
      } else {
        console.error('Failed to load image');
      }
    });
  }

  return (
    <canvas ref={canvasRef} className='border border-[var(--color-text)] rounded-xl'/>
  )
}
