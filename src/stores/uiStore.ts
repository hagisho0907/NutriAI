import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

export interface LoadingState {
  id: string;
  message: string;
  progress?: number;
}

export interface ModalState {
  id: string;
  component: string;
  props?: Record<string, any>;
  options?: {
    closable?: boolean;
    backdrop?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  };
}

interface UIStore {
  // Theme and appearance
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  compactMode: boolean;
  
  // Loading states
  globalLoading: boolean;
  loadingStates: LoadingState[];
  
  // Notifications
  notifications: Notification[];
  
  // Modals and overlays
  modals: ModalState[];
  
  // Navigation and routing
  activeTab: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
  
  // Form states
  unsavedChanges: boolean;
  formErrors: Record<string, string[]>;
  
  // View preferences
  viewMode: 'grid' | 'list';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, any>;
  
  // Mobile and responsive
  isMobile: boolean;
  sidebarOpen: boolean;
  
  // Actions - Theme and appearance
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  
  // Actions - Loading
  setGlobalLoading: (loading: boolean) => void;
  addLoadingState: (state: Omit<LoadingState, 'id'>) => string;
  updateLoadingState: (id: string, updates: Partial<LoadingState>) => void;
  removeLoadingState: (id: string) => void;
  clearLoadingStates: () => void;
  
  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string) => string;
  showWarning: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
  
  // Actions - Modals
  openModal: (modal: Omit<ModalState, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Actions - Navigation
  setActiveTab: (tab: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => void;
  
  // Actions - Forms
  setUnsavedChanges: (hasChanges: boolean) => void;
  setFormErrors: (errors: Record<string, string[]>) => void;
  addFormError: (field: string, error: string) => void;
  removeFormError: (field: string) => void;
  clearFormErrors: () => void;
  
  // Actions - View preferences
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleSortOrder: () => void;
  setFilter: (key: string, value: any) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  
  // Actions - Mobile
  setIsMobile: (isMobile: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      sidebarCollapsed: false,
      compactMode: false,
      globalLoading: false,
      loadingStates: [],
      notifications: [],
      modals: [],
      activeTab: 'dashboard',
      breadcrumbs: [],
      unsavedChanges: false,
      formErrors: {},
      viewMode: 'grid',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      filters: {},
      isMobile: false,
      sidebarOpen: false,

      // Theme and appearance actions
      setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),
      
      toggleSidebar: () => set(state => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
      
      setCompactMode: (compact: boolean) => set({ compactMode: compact }),

      // Loading actions
      setGlobalLoading: (loading: boolean) => set({ globalLoading: loading }),
      
      addLoadingState: (state: Omit<LoadingState, 'id'>) => {
        const id = Date.now().toString();
        const newLoadingState: LoadingState = { ...state, id };
        
        set(currentState => ({
          loadingStates: [...currentState.loadingStates, newLoadingState]
        }));
        
        return id;
      },
      
      updateLoadingState: (id: string, updates: Partial<LoadingState>) => {
        set(state => ({
          loadingStates: state.loadingStates.map(loading =>
            loading.id === id ? { ...loading, ...updates } : loading
          )
        }));
      },
      
      removeLoadingState: (id: string) => {
        set(state => ({
          loadingStates: state.loadingStates.filter(loading => loading.id !== id)
        }));
      },
      
      clearLoadingStates: () => set({ loadingStates: [] }),

      // Notification actions
      addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
        const id = Date.now().toString();
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: new Date(),
          duration: notification.duration ?? 5000
        };
        
        set(state => ({
          notifications: [...state.notifications, newNotification]
        }));

        // Auto-remove notification if not persistent
        if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
        
        return id;
      },
      
      removeNotification: (id: string) => {
        set(state => ({
          notifications: state.notifications.filter(notification => notification.id !== id)
        }));
      },
      
      clearNotifications: () => set({ notifications: [] }),
      
      showSuccess: (title: string, message?: string) => {
        return get().addNotification({
          type: 'success',
          title,
          message: message || ''
        });
      },
      
      showError: (title: string, message?: string) => {
        return get().addNotification({
          type: 'error',
          title,
          message: message || '',
          duration: 7000
        });
      },
      
      showWarning: (title: string, message?: string) => {
        return get().addNotification({
          type: 'warning',
          title,
          message: message || '',
          duration: 6000
        });
      },
      
      showInfo: (title: string, message?: string) => {
        return get().addNotification({
          type: 'info',
          title,
          message: message || ''
        });
      },

      // Modal actions
      openModal: (modal: Omit<ModalState, 'id'>) => {
        const id = Date.now().toString();
        const newModal: ModalState = { ...modal, id };
        
        set(state => ({
          modals: [...state.modals, newModal]
        }));
        
        return id;
      },
      
      closeModal: (id: string) => {
        set(state => ({
          modals: state.modals.filter(modal => modal.id !== id)
        }));
      },
      
      closeAllModals: () => set({ modals: [] }),

      // Navigation actions
      setActiveTab: (tab: string) => set({ activeTab: tab }),
      
      setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => 
        set({ breadcrumbs }),

      // Form actions
      setUnsavedChanges: (hasChanges: boolean) => set({ unsavedChanges: hasChanges }),
      
      setFormErrors: (errors: Record<string, string[]>) => set({ formErrors: errors }),
      
      addFormError: (field: string, error: string) => {
        set(state => ({
          formErrors: {
            ...state.formErrors,
            [field]: [...(state.formErrors[field] || []), error]
          }
        }));
      },
      
      removeFormError: (field: string) => {
        set(state => {
          const { [field]: removed, ...rest } = state.formErrors;
          return { formErrors: rest };
        });
      },
      
      clearFormErrors: () => set({ formErrors: {} }),

      // View preference actions
      setViewMode: (mode: 'grid' | 'list') => set({ viewMode: mode }),
      
      setSortBy: (field: string) => set({ sortBy: field }),
      
      setSortOrder: (order: 'asc' | 'desc') => set({ sortOrder: order }),
      
      toggleSortOrder: () => set(state => ({
        sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc'
      })),
      
      setFilter: (key: string, value: any) => {
        set(state => ({
          filters: { ...state.filters, [key]: value }
        }));
      },
      
      removeFilter: (key: string) => {
        set(state => {
          const { [key]: removed, ...rest } = state.filters;
          return { filters: rest };
        });
      },
      
      clearFilters: () => set({ filters: {} }),

      // Mobile actions
      setIsMobile: (isMobile: boolean) => set({ isMobile }),
      
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open })
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        compactMode: state.compactMode,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      })
    }
  )
);