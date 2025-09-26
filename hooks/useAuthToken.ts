import { authTokenAtom } from '@/atoms/auth';
import { useAtom } from 'jotai';

export function useAuthToken() {
  const [authToken, setAuthToken] = useAtom(authTokenAtom);
  return {
    authToken,
    setAuthToken,
  };
}
