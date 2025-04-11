import { create } from 'zustand';
import { timesheetService, TimeSheet, TimeEntry, TimeEntryInput } from '../services/timesheet.service';
import { useAuthStore } from './authStore';

interface TimesheetState {
  timesheets: TimeSheet[];
  currentTimesheet: TimeSheet | null;
  timeEntries: TimeEntry[];
  currentTimeEntry: TimeEntry | null;
  pendingApprovals: TimeSheet[];
  loading: boolean;
  error: string | null;
  
  // Timesheet actions
  fetchMyTimesheets: (status?: string) => Promise<void>;
  fetchTimesheet: (id: string) => Promise<void>;
  createTimesheet: (weekStarting: string) => Promise<TimeSheet>;
  submitTimesheet: (id: string) => Promise<void>;
  
  // Time entry actions
  fetchMyTimeEntries: (startDate?: string, endDate?: string) => Promise<void>;
  fetchTimeEntry: (id: string) => Promise<void>;
  createTimeEntry: (input: TimeEntryInput) => Promise<TimeEntry>;
  updateTimeEntry: (id: string, input: TimeEntryInput) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;
  
  // Manager actions
  fetchPendingApprovals: () => Promise<void>;
  approveTimesheet: (id: string, comments?: string) => Promise<void>;
  rejectTimesheet: (id: string, comments: string) => Promise<void>;
  
  // Utility actions
  clearCurrentTimesheet: () => void;
  clearCurrentTimeEntry: () => void;
  clearError: () => void;
}

export const useTimesheetStore = create<TimesheetState>((set, get) => ({
  timesheets: [],
  currentTimesheet: null,
  timeEntries: [],
  currentTimeEntry: null,
  pendingApprovals: [],
  loading: false,
  error: null,
  
  // Timesheet actions
  fetchMyTimesheets: async (status?: string) => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    set({ loading: true, error: null });
    try {
      const timesheets = await timesheetService.getMyTimesheets(token, status);
      set({ timesheets, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchTimesheet: async (id: string) => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    set({ loading: true, error: null });
    try {
      const timesheet = await timesheetService.getTimesheet(token, id);
      set({ currentTimesheet: timesheet, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createTimesheet: async (weekStarting: string) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error('Not authenticated');
    
    set({ loading: true, error: null });
    try {
      const timesheet = await timesheetService.createTimesheet(token, weekStarting);
      set(state => ({ 
        timesheets: [timesheet, ...state.timesheets],
        currentTimesheet: timesheet,
        loading: false 
      }));
      return timesheet;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  submitTimesheet: async (id: string) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error('Not authenticated');
    
    set({ loading: true, error: null });
    try {
      const updatedTimesheet = await timesheetService.submitTimesheet(token, id);
      
      // Update both the current timesheet and the timesheet in the list
      set(state => ({
        currentTimesheet: updatedTimesheet,
        timesheets: state.timesheets.map(ts => 
          ts.id === id ? updatedTimesheet : ts
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  // Time entry actions
  fetchMyTimeEntries: async (startDate?: string, endDate?: string) => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    set({ loading: true, error: null });
    try {
      const timeEntries = await timesheetService.getMyTimeEntries(token, startDate, endDate);
      set({ timeEntries, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchTimeEntry: async (id: string) => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    set({ loading: true, error: null });
    try {
      const timeEntry = await timesheetService.getTimeEntry(token, id);
      set({ currentTimeEntry: timeEntry, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createTimeEntry: async (input: TimeEntryInput) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error('Not authenticated');
    
    set({ loading: true, error: null });
    try {
      const timeEntry = await timesheetService.createTimeEntry(token, input);
      
      // If we have the current timesheet and this entry belongs to it, update it
      const { currentTimesheet } = get();
      if (currentTimesheet && timeEntry.timesheetId === currentTimesheet.id) {
        set(state => ({
          currentTimesheet: {
            ...state.currentTimesheet!,
            entries: [...(state.currentTimesheet?.entries || []), timeEntry],
            totalHours: (state.currentTimesheet?.totalHours || 0) + (timeEntry.duration || 0)
          }
        }));
      }
      
      set(state => ({ 
        timeEntries: [timeEntry, ...state.timeEntries],
        currentTimeEntry: timeEntry,
        loading: false 
      }));
      
      return timeEntry;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateTimeEntry: async (id: string, input: TimeEntryInput) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error('Not authenticated');
    
    set({ loading: true, error: null });
    try {
      const updatedTimeEntry = await timesheetService.updateTimeEntry(token, id, input);
      
      // Update the entry in all relevant places
      set(state => {
        // Update in timeEntries array
        const updatedTimeEntries = state.timeEntries.map(entry => 
          entry.id === id ? updatedTimeEntry : entry
        );
        
        // Update in currentTimesheet if present
        let updatedCurrentTimesheet = state.currentTimesheet;
        if (updatedCurrentTimesheet && updatedCurrentTimesheet.entries) {
          const updatedEntries = updatedCurrentTimesheet.entries.map(entry => 
            entry.id === id ? updatedTimeEntry : entry
          );
          
          // Recalculate total hours
          const totalHours = updatedEntries.reduce(
            (sum, entry) => sum + (entry.duration || 0), 
            0
          );
          
          updatedCurrentTimesheet = {
            ...updatedCurrentTimesheet,
            entries: updatedEntries,
            totalHours
          };
        }
        
        return {
          timeEntries: updatedTimeEntries,
          currentTimeEntry: updatedTimeEntry,
          currentTimesheet: updatedCurrentTimesheet,
          loading: false
        };
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  deleteTimeEntry: async (id: string) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error('Not authenticated');
    
    set({ loading: true, error: null });
    try {
      await timesheetService.deleteTimeEntry(token, id);
      
      // Remove the entry from all relevant places
      set(state => {
        // Get the entry to be deleted
        const entryToDelete = state.timeEntries.find(entry => entry.id === id);
        
        // Remove from timeEntries array
        const updatedTimeEntries = state.timeEntries.filter(entry => entry.id !== id);
        
        // Update currentTimesheet if present
        let updatedCurrentTimesheet = state.currentTimesheet;
        if (updatedCurrentTimesheet && updatedCurrentTimesheet.entries) {
          const updatedEntries = updatedCurrentTimesheet.entries.filter(entry => entry.id !== id);
          
          // Recalculate total hours
          const totalHours = updatedEntries.reduce(
            (sum, entry) => sum + (entry.duration || 0), 
            0
          );
          
          updatedCurrentTimesheet = {
            ...updatedCurrentTimesheet,
            entries: updatedEntries,
            totalHours
          };
        }
        
        return {
          timeEntries: updatedTimeEntries,
          currentTimeEntry: state.currentTimeEntry?.id === id ? null : state.currentTimeEntry,
          currentTimesheet: updatedCurrentTimesheet,
          loading: false
        };
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  // Manager actions
  fetchPendingApprovals: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    set({ loading: true, error: null });
    try {
      const pendingApprovals = await timesheetService.getPendingApprovals(token);
      set({ pendingApprovals, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  approveTimesheet: async (id: string, comments?: string) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error('Not authenticated');
    
    set({ loading: true, error: null });
    try {
      const updatedTimesheet = await timesheetService.approveTimesheet(token, id, comments);
      
      // Update in pendingApprovals list
      set(state => ({
        pendingApprovals: state.pendingApprovals.filter(ts => ts.id !== id),
        currentTimesheet: state.currentTimesheet?.id === id ? updatedTimesheet : state.currentTimesheet,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  rejectTimesheet: async (id: string, comments: string) => {
    const { token } = useAuthStore.getState();
    if (!token) throw new Error('Not authenticated');
    
    set({ loading: true, error: null });
    try {
      const updatedTimesheet = await timesheetService.rejectTimesheet(token, id, comments);
      
      // Update in pendingApprovals list
      set(state => ({
        pendingApprovals: state.pendingApprovals.filter(ts => ts.id !== id),
        currentTimesheet: state.currentTimesheet?.id === id ? updatedTimesheet : state.currentTimesheet,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  // Utility actions
  clearCurrentTimesheet: () => set({ currentTimesheet: null }),
  clearCurrentTimeEntry: () => set({ currentTimeEntry: null }),
  clearError: () => set({ error: null })
}));
