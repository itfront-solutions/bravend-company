import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LayoutType = 'top-navigation' | 'left-sidebar';
export type ThemeMode = 'light' | 'dark' | 'system';

interface LayoutState {
  layoutType: LayoutType;
  themeMode: ThemeMode;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  showBreadcrumbs: boolean;
  animationsEnabled: boolean;
  
  // Actions
  setLayoutType: (type: LayoutType) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setShowBreadcrumbs: (show: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaultState = {
  layoutType: 'top-navigation' as LayoutType,
  themeMode: 'light' as ThemeMode,
  sidebarCollapsed: false,
  compactMode: false,
  showBreadcrumbs: true,
  animationsEnabled: true,
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      
      setLayoutType: (type: LayoutType) => set({ layoutType: type }),
      
      setThemeMode: (mode: ThemeMode) => set({ themeMode: mode }),
      
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
      
      setCompactMode: (compact: boolean) => set({ compactMode: compact }),
      
      setShowBreadcrumbs: (show: boolean) => set({ showBreadcrumbs: show }),
      
      setAnimationsEnabled: (enabled: boolean) => set({ animationsEnabled: enabled }),
      
      resetToDefaults: () => set(defaultState),
    }),
    {
      name: 'orquestra-layout-settings',
      partialize: (state) => ({
        layoutType: state.layoutType,
        themeMode: state.themeMode,
        sidebarCollapsed: state.sidebarCollapsed,
        compactMode: state.compactMode,
        showBreadcrumbs: state.showBreadcrumbs,
        animationsEnabled: state.animationsEnabled,
      }),
    }
  )
);