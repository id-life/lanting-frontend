import instance from './request';

export interface GitHubUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  name: string;
}

// export interface AuthResponse {
//   access_token: string;
//   user: GitHubUser;
// }

// export interface LoginRequest {
//   username: string;
//   password: string;
// }

// Login with username and password
// export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
//   return instance.post('/auth/login', credentials);
// };

// Get current user profile
export const getUserProfile = async (): Promise<GitHubUser> => {
  return instance.get('/auth/profile');
};
