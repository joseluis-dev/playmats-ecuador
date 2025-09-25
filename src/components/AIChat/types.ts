export interface SealAttribute {
  id: number;
  name: string;
  value: string;
  color: string;
  createdAt: string | null;
  updatedAt: string;
}

export interface SealCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seal {
  id: number;
  publicId: string;
  name: string;
  url: string;
  thumbnail: string;
  watermark: string;
  hosting: string;
  type: string;
  categories: SealCategory[];
  attributes: SealAttribute[];
}

export interface SealSearchResult {
  found: boolean;
  count: number;
  seals: Seal[];
  message: string;
}

// Tipos genéricos para recursos reutilizables
export interface ResourceAttribute {
  id: number;
  name: string;
  value: string;
  color: string;
}

export interface ResourceCategory {
  id: number;
  name: string;
}

export interface ResourceItem {
  id: number;
  name: string;
  url: string;
  publicId?: string;
  thumbnail?: string;
  watermark?: string;
  hosting?: string;
  type?: string;
  attributes?: ResourceAttribute[];
  categories?: ResourceCategory[];
}

export interface ResourceSearchResult {
  found: boolean;
  count: number;
  items: ResourceItem[];
  message: string;
}