import { create } from 'zustand';

interface Post {
  id: string;
  section: string;
  title: string;
  type: 'text' | 'image' | 'video' | 'poem' | 'story';
  content: string;
  file_url?: string;
  likes: number;
  created_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  text: string;
  created_at: string;
}

interface HealthData {
  lastPeriodDate?: string;
  cycleLength: number;
  pregnancyStartDate?: string;
  lastFeedingTime?: string;
  feedingCount: number;
}

interface AppState {
  isAdmin: boolean;
  posts: Post[];
  comments: Comment[];
  healthData: HealthData;
  isLoading: boolean;
  setAdmin: (isAdmin: boolean) => void;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  deletePost: (id: string) => void;
  likePost: (id: string) => void;
  addComment: (comment: Comment) => void;
  updateHealthData: (data: Partial<HealthData>) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  isAdmin: false,
  posts: [],
  comments: [],
  healthData: {
    cycleLength: 28,
    feedingCount: 0
  },
  isLoading: false,
  setAdmin: (isAdmin) => set({ isAdmin }),
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [...state.posts, post] })),
  deletePost: (id) => set((state) => ({ posts: state.posts.filter(p => p.id !== id) })),
  likePost: (id) => set((state) => ({
    posts: state.posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p)
  })),
  addComment: (comment) => set((state) => ({ comments: [...state.comments, comment] })),
  updateHealthData: (data) => set((state) => ({
    healthData: { ...state.healthData, ...data }
  })),
  setLoading: (loading) => set({ isLoading: loading })
}));
