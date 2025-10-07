import { useEffect, useRef } from 'react';
import { Canvas, Control, FabricImage, util as fabricUtil, filters } from 'fabric';
import { useCustomizationTool } from '@/stores/customToolStore';

const deleteIcon =
    "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

export const FabricCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const { imgSrc, setImgSrc, layers, removeLayer, size, modifyItems, setCanvasRef, formRef, reset } = useCustomizationTool()
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const tintImage = (img: FabricImage, color: string) => {
    // Limpia filtros previos que puedan interferir
    img.filters = [];

    // Mejorar filtros para efectos dorado/plateado más visibles
    if (color.toLowerCase().includes('gold')) {
      // Filtro dorado optimizado
      img.filters.push(new filters.Saturation({ saturation: -0.5 }));
      img.filters.push(new filters.BlendColor({
        color: '#FFD700',
        mode: 'overlay',
        alpha: 0.7
      }));
      img.filters.push(new filters.Brightness({ brightness: 0.2 }));
    } else if (color.toLowerCase().includes('silver')) {
      // Filtro plateado optimizado
      img.filters.push(new filters.Saturation({ saturation: -0.5 }));
      img.filters.push(new filters.BlendColor({
        color: '#E8E8E8',
        mode: 'overlay',
        alpha: 0.7
      }));
      img.filters.push(new filters.Brightness({ brightness: 0.5 }));
    } else {
      // Otros colores con overlay en lugar de multiply
      img.filters.push(new filters.BlendColor({
        color,
        mode: 'overlay',
        alpha: 0.6
      }));
    }

    // Un toque de contraste para “sacar” brillos
    img.filters.push(new filters.Contrast({ contrast: 0.1 }));
    img.applyFilters();
    
    // Mejorar timing del renderizado
    setTimeout(() => {
      img.canvas?.requestRenderAll();
    }, 10);
  }

  // Helpers: radio del wrapper, gap (distancia entre bordes), y dibujo del anillo
  const getWrapperRadius = () => {
    if (!wrapperRef.current) return 12; // aprox. rounded-xl
    const cs = window.getComputedStyle(wrapperRef.current);
    const r = parseFloat(cs.borderTopLeftRadius || '12');
    return isNaN(r) ? 12 : r;
  };

  const getGap = () => {
    if (!wrapperRef.current || !overlayRef.current) return 8; // coincide con inset-2 (~8px)
    // const w = wrapperRef.current.getBoundingClientRect();
    // const o = overlayRef.current.getBoundingClientRect();
    // const gap = Math.max(0, Math.round(o.left - w.left));
    // return gap || 8;
    return 8;
  };

  const syncRingRadii = () => {
    const ring = ringRef.current;
    const inner = overlayRef.current;
    if (!ring || !inner) return;
    const outerRadius = getWrapperRadius();
    const gap = getGap();
    const innerRadius = Math.max(0, outerRadius - gap);
    ring.style.borderRadius = `${outerRadius}px`;
    inner.style.borderRadius = `${innerRadius}px`;
  };

  const setRingFill = (fill: { color?: string; image?: string } | null) => {
    const ring = ringRef.current;
    if (!ring) return;
    // Reset
    ring.style.background = 'transparent';
    ring.style.backgroundImage = '';
    ring.style.backgroundSize = '';
    ring.style.backgroundPosition = '';
    ring.style.padding = '0px';
    ring.style.mask = '';
    (ring.style as any).webkitMaskComposite = '';
    (ring.style as any).maskComposite = '';
    if (!fill) return; // anillo transparente

    const gap = getGap();
    ring.style.background = fill.color || 'transparent';
    // Máscara para recortar el interior y formar un anillo perfecto
    ring.style.padding = `${gap}px`;
    ring.style.mask = 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)';
    (ring.style as any).webkitMaskComposite = 'xor';
    (ring.style as any).maskComposite = 'exclude';
  };
  
  const deleteImgRef = useRef<HTMLImageElement | null>(null);
  // Load delete icon image once
  useEffect(() => {
    const img = document.createElement('img');
    img.src = deleteIcon;
    deleteImgRef.current = img;
  }, []);

  useEffect(() => {
    reset();
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, {
      width: size.width,
      height: size.height,
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = canvas;
    setCanvasRef(canvas);

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
        setImgSrc({
          url: null,
          layer: null,
          action: null,
        })
        setCanvasRef(null);
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

      // Animar SOLO los bordes decorativos para suavizar la percepción
      // sin escalar el bitmap del canvas y evitar distorsión.
      const timing: KeyframeAnimationOptions = { duration: 250, easing: 'ease-in-out' };
      wrapperRef.current?.animate?.(
        [
          { transform: 'scale(0.99)' },
          { transform: 'scale(1)' }
        ],
        timing
      );
      overlayRef.current?.animate?.(
        [
          { transform: 'scale(0.985)' },
          { transform: 'scale(1)' }
        ],
        timing
      );
      // Re-sincronizar radios y relleno del anillo tras actualizar tamaño
      syncRingRadii();
      const currentBorder = formRef?.getValues?.('border');
      const name = currentBorder?.name?.toLowerCase?.() || '';
      if (!name || name.includes('sin borde') || name.includes('transparente')) {
        setRingFill(null);
      } else if (name.includes('negro')) {
        setRingFill({ color: '#000' });
      } else {
        setRingFill(null);
      }
    }
  }, [size]);

  useEffect(() => {
    if (imgSrc?.url && imgSrc?.action === 'add') {
      handleAddImage(imgSrc);
    }
  }, [imgSrc, layers]);

  // Sincronizar apariencia de los bordes según el valor de `border` en el formulario
  useEffect(() => {
    if (!formRef) return;

    const applyBorderStyle = (border: any) => {
      const name: string | undefined = border?.name;
      const inner = overlayRef.current;
      if (!inner) return;
      // Mostrar/ocultar borde interno
      inner.style.display = '';
      syncRingRadii();

      // Casos:
      // - "Bordes color negro": rellenar anillo entre bordes de negro
      // - "Bordes transparentes": dejar anillo transparente (como ahora)
      // - "Bordes sin borde": ocultar borde interno y anillo (solo borde exterior)
      if (!name || name?.toLowerCase().includes('sin borde')) {
        inner.style.display = 'none';
        setRingFill(null);
        return;
      }

      if (name?.toLowerCase().includes('transparente')) {
        // Mantener tal cual (anillo transparente)
        setRingFill(null);
        return;
      }

      if (name?.toLowerCase().includes('negro')) {
        // Pintar el anillo con textura (si existe) o negro sólido
        // const url: string | undefined = border?.url;
        // if (url) setRingFill({ image: url }); else setRingFill({ color: '#000' });
        setRingFill({ color: '#000' });
        return;
      }

      // Default: transparente
      setRingFill(null);
    };

    // Aplicar al cargar
    applyBorderStyle(formRef.getValues('border'));

    // Suscribirse a cambios en el campo 'border'
    const subscription = (formRef as any).watch?.((value: any, info: any) => {
      if (info?.name === 'border') {
        applyBorderStyle(value?.border);
      }
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [formRef]);

  // Delete handler for control
  const deleteObject = (_eventData: any, transform: any) => {
    const canvas = transform.target.canvas;
    removeLayer(transform.target.layer, transform.target.id);
    canvas.remove(transform.target);
    canvas.requestRenderAll();
    modifyItems('images', canvas.getObjects());
    if (transform.target.layer === 'seals' && formRef) {
      const current: any[] = formRef.getValues('seals') || [];
      const idx = current.findIndex((s: any) => s?.url === transform.target.id);
      if (idx >= 0) {
        const next = current.slice();
        next.splice(idx, 1); // Remove only ONE occurrence
        formRef.setValue('seals', next, { shouldDirty: true, shouldTouch: true, shouldValidate: false });
      }
    }
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
    // Cargar imágenes con CORS habilitado (Cloudinary envía ACAO: *)
    FabricImage.fromURL(imgSrc.url, { crossOrigin: 'anonymous' }).then((img) => {
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
        if (imgSrc.attributes && imgSrc.attributes.find((attr: any) => attr.name.includes('price'))) {
          img.set('price', imgSrc.attributes.find((attr: any) => attr.name.includes('price')).value);
        }
        const objects = fabricCanvasRef.current.getObjects()
        modifyItems('images', [...objects, img]);
        if (imgSrc.layer) {
          let lastIndexInLayer = -1
          let foundIndex = false
          for (let i = objects.length - 1; i >= 0 && !foundIndex; i--) {
            if ((objects[i] as any).layer === imgSrc.layer) {
              lastIndexInLayer = i
              foundIndex = true
            }
          }
          if (lastIndexInLayer >= 0) {
            fabricCanvasRef.current.insertAt(lastIndexInLayer + 1, img);
          } else if (imgSrc.layer !== 'background') {
            fabricCanvasRef.current.add(img);
          } else {
            fabricCanvasRef.current.insertAt(0, img);
          }
        }
        
        // Renderizar primero para que la imagen esté en el canvas
        fabricCanvasRef.current.renderAll();
        
        // Aplicar filtro con mejor timing, especialmente para seals
        setTimeout(() => {
          imgSrc.layer === 'seals' && tintImage(img, imgSrc.color || 'gold');
        }, 10);
        
        if (imgSrc.url.startsWith('blob:')) {
          // Si es un blob, liberar memoria
          URL.revokeObjectURL(imgSrc.url);
        }
      } else {
        console.error('Failed to load image');
      }
    });
  }

  return (
    <div
      ref={wrapperRef}
      style={{ width: `${size.width + 2}px`, height: `${size.height + 2}px` }}
      className='relative rounded-xl border !border-[var(--color-text)]'
    >
      {/* Mantener el canvas sin transiciones CSS para evitar escalado/blur */}
      <canvas ref={canvasRef} className='block rounded-xl' />
      {/* Capa que rellena el anillo entre bordes (por defecto transparente) */}
      <div ref={ringRef} className='pointer-events-none absolute inset-0 rounded-xl z-10'></div>
      {/* Borde interno para el efecto de doble borde */}
      <div ref={overlayRef} className='pointer-events-none absolute inset-2 rounded-xl border-2 !border-black z-20'></div>
    </div>
  )
}
