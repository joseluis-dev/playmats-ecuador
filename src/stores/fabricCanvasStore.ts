import { create } from "zustand";

interface FabricCanvasState {
  imgUrl: string | null;
  setImgUrl: (url: string | null) => void;
}

export const useFabricCanvasStore = create<FabricCanvasState>((set) => ({
  imgUrl: null,
  setImgUrl: (url) => set({ imgUrl: url }),
}));