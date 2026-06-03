import { create } from 'zustand';
import type { Section, User } from '../types';

interface AppState {
  user: User | null;
  sections: Section[];
  activeSectionId: string | null;
  setUser: (user: User | null) => void;
  setSections: (sections: Section[]) => void;
  setActiveSectionId: (id: string | null) => void;
  addSection: (section: Section) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  sections: [],
  activeSectionId: null,
  setUser: (user) => set({ user }),
  setSections: (sections) => set({ sections }),
  setActiveSectionId: (id) => set({ activeSectionId: id }),
  addSection: (section) => set((state) => ({ sections: [...state.sections, section] })),
  removeSection: (id) => set((state) => ({ sections: state.sections.filter(s => s.id !== id) })),
  updateSection: (id, updates) => set((state) => ({
    sections: state.sections.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
}));
