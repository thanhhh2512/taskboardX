import { authApi } from "@/lib/api";

export type AuthTokens = {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

// Get tokens from localStorage
export const getAuthTokens = (): AuthTokens | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  const expiresAtStr = localStorage.getItem("expiresAt");
  const userStr = localStorage.getItem("user");

  if (!token || !refreshToken || !expiresAtStr || !userStr) return null;

  try {
    const user = JSON.parse(userStr);
    const expiresAt = expiresAtStr;
    return {
      token,
      refreshToken,
      expiresAt,
      user,
    };
  } catch (error) {
    console.error("Error parsing user data from localStorage", error);
    return null;
  }
};

// Set tokens to localStorage
export const setAuthTokens = (authData: AuthTokens): void => {
  localStorage.setItem("token", authData.token);
  localStorage.setItem("refreshToken", authData.refreshToken);
  localStorage.setItem("expiresAt", authData.expiresAt);
  localStorage.setItem("userId", authData.user.id);
  localStorage.setItem("user", JSON.stringify(authData.user));
};

// Clear tokens from localStorage
export const clearAuthTokens = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("expiresAt");
  localStorage.removeItem("userId");
  localStorage.removeItem("user");
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const tokens = getAuthTokens();
  if (!tokens) return false;

  // Check if token is expired
  const expiresAt = new Date(tokens.expiresAt).getTime();
  const now = new Date().getTime();

  return now < expiresAt;
};

// Login function
export const login = async (
  email: string,
  password: string
): Promise<AuthTokens> => {
  const response = await authApi.login({ email, password });
  setAuthTokens(response);
  return response;
};

// Signup function
export const signup = async (
  email: string,
  password: string,
  name: string,
  role: string = "user"
): Promise<AuthTokens> => {
  const response = await authApi.signup({ email, password, name, role });
  setAuthTokens(response);
  return response;
};

// Logout function
export const logout = (): void => {
  clearAuthTokens();
};

// Get current user
export const getCurrentUser = async () => {
  const tokens = getAuthTokens();
  console.log("token: ",tokens);
  if (!tokens) throw new Error("Not authenticated");

  return await authApi.getCurrentUser(tokens.user.id);
};
