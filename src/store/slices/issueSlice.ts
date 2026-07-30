import type { StateCreator } from 'zustand';
import type { Issue, NewIssue, IssueCategory, IssueStatus } from '../../types/issue';

export interface IssueSlice {
  issues: Issue[];
  selectedIssue: Issue | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    category: IssueCategory | 'all';
    status: IssueStatus | 'all';
    search: string;
  };

  // Actions
  setIssues: (issues: Issue[]) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  removeIssue: (id: string) => void;
  selectIssue: (issue: Issue | null) => void;
  setFilter: (filter: Partial<IssueSlice['filters']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Future: These will be implemented when backend is connected
  fetchIssues: () => Promise<void>;
  createIssue: (issue: NewIssue) => Promise<Issue | null>;
  resolveIssue: (id: string) => Promise<void>;
}

export const createIssueSlice: StateCreator<IssueSlice, [], [], IssueSlice> = (set, get) => ({
  issues: [],
  selectedIssue: null,
  isLoading: false,
  error: null,
  filters: {
    category: 'all',
    status: 'all',
    search: '',
  },

  setIssues: (issues) => set({ issues }),
  addIssue: (issue) => set((state) => ({ issues: [issue, ...state.issues] })),
  updateIssue: (id, updates) =>
    set((state) => ({
      issues: state.issues.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      selectedIssue: state.selectedIssue?.id === id ? { ...state.selectedIssue, ...updates } : state.selectedIssue,
    })),
  removeIssue: (id) =>
    set((state) => ({
      issues: state.issues.filter((i) => i.id !== id),
      selectedIssue: state.selectedIssue?.id === id ? null : state.selectedIssue,
    })),
  selectIssue: (issue) => set({ selectedIssue: issue }),
  setFilter: (filter) => set((state) => ({ filters: { ...state.filters, ...filter } })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Future implementations (stubs for now)
  fetchIssues: async () => {
    // TODO: Connect to API
    set({ isLoading: false });
  },
  createIssue: async (_issue) => {
    // TODO: Connect to API
    return null;
  },
  resolveIssue: async (_id) => {
    // TODO: Connect to API
  },
});