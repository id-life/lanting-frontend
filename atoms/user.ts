import { GitHubUser } from '@/apis/auth';
import { atom } from 'jotai';

export interface GitHubOAuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
  isLoading: boolean;
}

export const githubUserStateAtom = atom<GitHubOAuthState>({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
});
