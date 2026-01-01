import { create } from 'zustand';
import { Resource } from '../types/game.types';

interface ResourceStore {
  resources: Record<string, Resource>;
  addResource: (resourceId: string, amount: number) => void;
  removeResource: (resourceId: string, amount: number) => void;
  setResource: (resource: Resource) => void;
  getResource: (resourceId: string) => Resource | undefined;
  getResourceAmount: (resourceId: string) => number;
}

const initialResources: Record<string, Resource> = {
  'raw-fabric': { id: 'raw-fabric', name: 'Raw Fabric', amount: 50, type: 'raw' },
  'raw-plastic': { id: 'raw-plastic', name: 'Raw Plastic', amount: 30, type: 'raw' },
  'raw-metal': { id: 'raw-metal', name: 'Raw Metal', amount: 20, type: 'raw' },
  'raw-electronics': { id: 'raw-electronics', name: 'Raw Electronics', amount: 15, type: 'raw' },
  'raw-glass': { id: 'raw-glass', name: 'Raw Glass', amount: 10, type: 'raw' },
};

export const useResourceStore = create<ResourceStore>((set, get) => ({
  resources: initialResources,
  
  addResource: (resourceId, amount) => set((state) => {
    const resource = state.resources[resourceId];
    if (resource) {
      return {
        resources: {
          ...state.resources,
          [resourceId]: { ...resource, amount: resource.amount + amount }
        }
      };
    }
    return state;
  }),
  
  removeResource: (resourceId, amount) => set((state) => {
    const resource = state.resources[resourceId];
    if (resource && resource.amount >= amount) {
      return {
        resources: {
          ...state.resources,
          [resourceId]: { ...resource, amount: resource.amount - amount }
        }
      };
    }
    return state;
  }),
  
  setResource: (resource) => set((state) => ({
    resources: {
      ...state.resources,
      [resource.id]: resource
    }
  })),
  
  getResource: (resourceId) => get().resources[resourceId],
  
  getResourceAmount: (resourceId) => {
    const resource = get().resources[resourceId];
    return resource?.amount || 0;
  },
}));

