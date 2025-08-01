import { create } from "zustand";

interface FabricCanvasState {
  imgSrc: Record<string, any> | null;
  layers: Record<string, any[]>;
  size: {
    width: number;
    height: number;
  };
  setSize: (width: number, height: number) => void;
  setImgSrc: (url: object | null) => void;
  addLayers: (name: string, object: any) => void;
  removeLayer: (name: string, id: string) => void;
}

export const useFabricCanvasStore = create<FabricCanvasState>((set) => ({
  imgSrc: {
    url: null,
    layer: null,
    action: null,
  },
  layers: {},
  size: {
    width: 610,
    height: 355,
  },
  setSize: (width: number, height: number) => set((state) => ({
    ...state,
    size: { width, height },
  })),
  setImgSrc: (url) => set({ imgSrc: url }),
  addLayers: (name: string, object: any) => set((state) => {
    const newLayers = state.layers[name] ? [...state.layers[name], object] : [object];
    return ({
      ...state,
      imgSrc: {
        url: object.url,
        layer: name,
        action: 'add',
      },
      layers: {
        ...state.layers,
        [name]: newLayers,
      },
    })
  }),
  removeLayer: (name: string, id: string) => set((state) => {
    const duplicates = (state.layers[name] || []).filter(item => item.url === id);
    const rest = (state.layers[name] || []).filter(item => item.url !== id);
    const newLayers = duplicates.length > 1 ? [...rest, ...duplicates.slice(1)] : rest;
    return {
      ...state,
      imgSrc: {
        url: null,
        layer: null,
        action: 'remove',
      },
      layers: {
        ...state.layers,
        [name]: newLayers,
      },
    };
  }),
}));