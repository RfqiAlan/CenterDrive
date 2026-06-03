import { create } from 'zustand';
import type { Section, User } from '../types';

interface AppState {
  user: User | null;
  sections: Section[];
  activeSectionId: string | null;
  isSidebarOpen: boolean;
  setUser: (user: User | null) => void;
  setSections: (sections: Section[]) => void;
  setActiveSectionId: (id: string | null) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  addSection: (section: Section) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  sections: [],
  activeSectionId: null,
  isSidebarOpen: false,
  setUser: (user) => set({ user }),
  setSections: (sections) => set({ sections }),
  setActiveSectionId: (id) => set({ activeSectionId: id, isSidebarOpen: false }), // Close sidebar on mobile when selecting
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  addSection: (section) => set((state) => ({ sections: [...state.sections, section] })),
  removeSection: (id) => set((state) => ({ sections: state.sections.filter(s => s.id !== id) })),
  updateSection: (id, updates) => set((state) => ({
    sections: state.sections.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
}));
