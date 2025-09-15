import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthToken } from './useAuthToken';
import { useEffect } from 'react';

export function useTokenRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { setAuthToken } = useAuthToken();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Only use setAuthToken, it will handle localStorage properly
      setAuthToken(token);
      router.push('/user');
      return;
    }
  }, [searchParams, router, setAuthToken]);
}
