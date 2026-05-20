export type DrawMode = 'names' | 'numbers' | 'wheel' | 'groups';

export interface WinnerHistory {
  id: string;
  timestamp: Date;
  mode: DrawMode;
  title: string;
  result: string[]; // Can be multiple winners drawn at once
}

export interface Preset {
  id: string;
  name: string;
  items: string[];
}
