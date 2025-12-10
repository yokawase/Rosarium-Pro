export type FertilizerType = 'VITALIZER' | 'SOLID' | 'LIQUID';
export type PhotoType = 'PRUNING_BEFORE' | 'PRUNING_AFTER' | 'GENERAL' | 'BLOOM';

export interface RosePhoto {
  id: string;
  url: string; // Base64 or Blob URL
  date: string; // ISO String
  type: PhotoType;
  note?: string;
}

export interface RoseNote {
  id: string;
  date: string; // ISO String
  content: string;
}

export interface RoseEvent {
  id: string;
  type: 'FERTILIZER' | 'TRANSPLANT' | 'PRUNING' | 'PLANTING' | 'OTHER' | 'PEST_CONTROL' | 'BLOOM';
  date: string; // ISO String
  details: string;
  subType?: FertilizerType | string;
}

export interface RoseVariety {
  id: string;
  breeder: string;
  name: string;
  registrationDate: string; // ISO String
  plantingDate?: string; // ISO String
  transplantDate?: string; // ISO String
  events: RoseEvent[];
  photos: RosePhoto[];
  notes: RoseNote[]; // Journal entries
  memo: string; // Legacy / General Description
  roseType?: number;
  feature?: string;
}

export type ViewState = 
  | { type: 'LIST' }
  | { type: 'NEW' }
  | { type: 'DETAIL'; roseId: string }
  | { type: 'SETTINGS' };