import type { StateCreator } from 'zustand';
import type { Issue, NewIssue, IssueCategory, IssueStatus } from '../../types/issue';
import { apiClient } from '../../services/api/client';

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

  // API-backed actions
  fetchIssues: () => Promise<void>;
  createIssue: (issue: NewIssue) => Promise<Issue | null>;
  resolveIssue: (id: string) => Promise<void>;
  getIssueById: (id: string) => Issue | undefined;
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

  fetchIssues: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<Issue[]>('/issues');
      if (res.error) {
        set({ error: res.error, isLoading: false });
        return;
      }
      set({ issues: res.data, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createIssue: async (issue) => {
    try {
      // Upload photo files to the server first so they persist on disk
      let photos: Issue['photos'] = [];
      if (issue.photos.length > 0) {
        const formData = new FormData();
        for (const file of issue.photos) {
          formData.append('photos', file);
        }
        formData.append('uploadedBy', 'anonymous');
        formData.append('isBefore', 'true');

        const uploadRes = await apiClient.upload<{ photos: Issue['photos'] }>('/uploads', formData);
        if (uploadRes.error) {
          set({ error: `Photo upload failed: ${uploadRes.error}` });
          return null;
        }
        photos = uploadRes.data.photos;
      }

      const payload = {
        title: issue.title,
        description: issue.description,
        category: issue.category,
        severity: issue.severity,
        location: issue.location,
        address: issue.address,
        localityId: issue.localityId,
        photos,
        reportedAt: new Date().toISOString(),
      };

      const res = await apiClient.post<Issue>('/issues', payload);
      if (res.error) {
        set({ error: res.error });
        return null;
      }
      const newIssue = res.data;
      set((state) => ({ issues: [newIssue, ...state.issues] }));
      return newIssue;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },

  resolveIssue: async (id) => {
    try {
      const res = await apiClient.patch<Issue>(`/issues/${id}`, { status: 'resolved', resolvedAt: new Date().toISOString() });
      if (res.error) {
        set({ error: res.error });
        return;
      }
      const updated = res.data;
      set((state) => ({
        issues: state.issues.map((i) => (i.id === id ? updated : i)),
        selectedIssue: state.selectedIssue?.id === id ? updated : state.selectedIssue,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  getIssueById: (id) => get().issues.find((i) => i.id === id),
});