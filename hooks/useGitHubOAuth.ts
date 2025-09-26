import { getUserProfile } from '@/apis/auth';
import { githubUserStateAtom } from '@/atoms/user';
import { NEXT_PUBLIC_API_BASE_URL } from '@/constants/env';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { useAuthToken } from './useAuthToken';
import { message } from 'antd';

const userQueryKey = 'fetch_user_profile';

export const useGitHubOAuth = () => {
  const queryClient = useQueryClient();
  const [githubUserState, setGithubUserState] = useAtom(githubUserStateAtom);
  const { authToken, setAuthToken } = useAuthToken();

  const userQuery = useQuery({
    queryKey: [userQueryKey, authToken],
    queryFn: async () => {
      if (!authToken) {
        throw new Error('No access token');
      }
      return await getUserProfile();
    },
    enabled: !!authToken,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      setAuthToken(null);
      queryClient.removeQueries({ queryKey: [userQueryKey] });
    },
    onSuccess: () => {
      message.success('Logout success');
      setGithubUserState({ isAuthenticated: false, user: null, token: null, isLoading: false });
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      message.error('Logout failed');
    },
  });

  const { mutate: logout } = logoutMutation;

  useEffect(() => {
    if (userQuery.isError) {
      const error = userQuery.error as any;
      console.error('Get user profile failed:', error);
      logout();
    }
  }, [userQuery.isError, userQuery.error, logout]);

  useEffect(() => {
    const isLoading = !!authToken && userQuery.isLoading;
    const user = userQuery.data || null;
    const isAuthenticated = !!authToken && !!user;

    setGithubUserState({
      isAuthenticated,
      user,
      token: authToken,
      isLoading,
    });
  }, [authToken, userQuery.isLoading, userQuery.data, setGithubUserState]);

  const login = useCallback(() => {
    try {
      window.location.href = NEXT_PUBLIC_API_BASE_URL + '/auth/github';
    } catch (error) {
      console.error('GitHub OAuth Login Failed:', error);
      message.error('GitHub OAuth Login Failed');
    }
  }, []);

  return {
    ...githubUserState,
    login,
    logout,
    isRefreshing: userQuery.isFetching,
    isError: userQuery.isError,
    error: userQuery.error,
  };
};
