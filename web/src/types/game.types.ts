export interface GameState {
  money: number;
  level: number;
  xp: number;
  energy: number;
  isPaused: boolean;
}

export interface Resource {
  id: string;
  name: string;
  amount: number;
  type: 'raw' | 'product' | 'waste' | 'recycled';
}

export interface Building {
  id: string;
  type: string;
  x: number;
  y: number;
  level: number;
}

export interface CityState {
  size: number;
  buildings: Building[];
}

