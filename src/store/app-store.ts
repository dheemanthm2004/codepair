import { create } from 'zustand';

interface AppState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AppActions {
  setTheme: (theme: 'dark' | 'light') => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  theme: 'dark',
  sidebarOpen: false,
  isLoading: false,
  error: null,

  setTheme: (theme) => set({ theme }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
