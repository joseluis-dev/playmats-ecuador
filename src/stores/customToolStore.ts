import { create } from "zustand";
import type { Resource } from "@/types";

interface FabricCanvasState {
  canvasRef: any;
  formRef: any;
  total: number;
  items: Record<string, any>;
  imgSrc: Record<string, any> | null;
  layers: Record<string, any[]>;
  // Loading flag for async operations (e.g., submit/add to cart)
  loading: boolean;
  size: {
    width: number;
    height: number;
  };
  // Shared resources state
  seals: Resource[];
  borders: Resource[];
  types: Resource[];
  sizes: Resource[];
  setCanvasRef: (canvasRef: any) => void;
  setFormRef: (formRef: any) => void;
  setSize: (width: number, height: number) => void;
  setImgSrc: (url: object | null) => void;
  setImgColor: (color: string | null) => void;
  addLayers: (name: string, object: any) => void;
  modifyItems: (name: string, item: number | any[]) => void;
  removeLayer: (name: string, id: string) => void;
  // Setters for shared resources
  setSeals: (list: Resource[]) => void;
  setBorders: (list: Resource[]) => void;
  setTypes: (list: Resource[]) => void;
  setSizes: (list: Resource[]) => void;
  // Generic loading setter
  setLoading: (loading: boolean) => void;
  // Reset state to initial values
  reset: (newState?: Partial<FabricCanvasState>) => void;
}

export const useCustomizationTool = create<FabricCanvasState>((set) => ({
  canvasRef: null,
  formRef: null,
  total: 0,
  items: {
    size: 0,
    border: 0,
  },
  imgSrc: {
    url: null,
    layer: null,
    action: null,
    color: null,
  },
  layers: {},
  loading: false,
  size: {
    width: 610,
    height: 225,
  },
  seals: [],
  borders: [],
  types: [],
  sizes: [],
  setCanvasRef: (canvasRef: any) => set({ canvasRef }),
  setFormRef: (formRef: any) => set({ formRef }),
  setSize: (width: number, height: number) => set((state) => ({
    ...state,
    size: { width, height },
  })),
  setImgSrc: (url) => set({ imgSrc: url }),
  setImgColor: (color) => set({ imgSrc: { color } }),
  setSeals: (list) => set(() => ({ seals: list })),
  setBorders: (list) => set(() => ({ borders: list })),
  setTypes: (list) => set(() => ({ types: list })),
  setSizes: (list) => set(() => ({ sizes: list })),
  setLoading: (loading: boolean) => set(() => ({ loading })),
  addLayers: (name: string, object: any) => set((state) => {
    const newLayers = state.layers[name] ? [...state.layers[name], object] : [object];
    return ({
      ...state,
      imgSrc: {
        color: state.imgSrc?.color || null,
        ...object,
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
        color: state.imgSrc?.color || null,
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
  modifyItems: (name: string, item: number | any[]) => set((state) => {
    const currentItems = { ...state.items };
    let total = state.total;
    if (currentItems[name] !== undefined) {
      if (Array.isArray(item)) {
        for (let i = 0; i < currentItems[name].length; i++) {
          const el = currentItems[name][i];
          if (el.price) {
            total -= parseFloat(el.price);
          }
        }
        currentItems[name] = item;
        for (let i = 0; i < currentItems[name].length; i++) {
          const el = currentItems[name][i];
          if (el.price) {
            total += parseFloat(el.price);
          }
        }
      }

      if (typeof item === 'number') {
        total -= currentItems[name];
        currentItems[name] = [item];
        total += item;
      }
    } else {
      if (Array.isArray(item)) {
        currentItems[name] = item;
        for (let i = 0; i < item.length; i++) {
          const el = item[i];
          if (el.price) {
            total += parseFloat(el.price);
          }
        }
      }
      if (typeof item === 'number') {
        currentItems[name] = [item];
        total += item;
      }
    }
    return {
      ...state,
      items: currentItems,
      total: total,
    };
  }),
  reset: (newState) => set((state) => ({
    ...state,
    canvasRef: null,
    formRef: null,
    total: 0,
    items: {
      size: 0,
      border: 0,
    },
    imgSrc: {
      url: null,
      layer: null,
      action: null,
      color: null,
    },
    layers: {},
    loading: false,
    size: {
      width: 610,
      height: 225,
    },
    seals: [],
    borders: [],
    types: [],
    sizes: [],
    ...newState,
  }))
}));