import { create } from 'zustand';
import { GameState } from '../types/game.types';

interface GameStore extends GameState {
  setMoney: (amount: number) => void;
  addMoney: (amount: number) => void;
  setLevel: (level: number) => void;
  addXP: (amount: number) => void;
  setEnergy: (energy: number) => void;
  togglePause: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  money: 500000,
  level: 1,
  xp: 0,
  energy: 100,
  isPaused: false,
  
  setMoney: (amount) => set({ money: amount }),
  addMoney: (amount) => set((state) => ({ money: state.money + amount })),
  setLevel: (level) => set({ level }),
  addXP: (amount) => set((state) => {
    const newXP = state.xp + amount;
    // Calculate level based on XP (simplified)
    const newLevel = Math.min(10, Math.floor(newXP / 100) + 1);
    return { xp: newXP, level: newLevel };
  }),
  setEnergy: (energy) => set({ energy }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
}));

