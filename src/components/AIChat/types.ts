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