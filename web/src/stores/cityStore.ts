import { create } from 'zustand';
import { CityState, Building } from '../types/game.types';

interface CityStore extends CityState {
  addBuilding: (building: Building) => void;
  removeBuilding: (x: number, y: number) => void;
  getBuilding: (x: number, y: number) => Building | undefined;
  updateBuilding: (x: number, y: number, updates: Partial<Building>) => void;
}

export const useCityStore = create<CityStore>((set, get) => ({
  size: 16,
  buildings: [],
  
  addBuilding: (building) => set((state) => ({
    buildings: [...state.buildings, building]
  })),
  
  removeBuilding: (x, y) => set((state) => ({
    buildings: state.buildings.filter(b => !(b.x === x && b.y === y))
  })),
  
  getBuilding: (x, y) => {
    return get().buildings.find(b => b.x === x && b.y === y);
  },
  
  updateBuilding: (x, y, updates) => set((state) => ({
    buildings: state.buildings.map(b => 
      b.x === x && b.y === y ? { ...b, ...updates } : b
    )
  })),
}));

