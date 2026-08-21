import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Get the stored authentication token.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (err) {
    console.error('Failed to get auth token:', err);
    return null;
  }
}

/**
 * Store the authentication token.
 */
export async function setAuthToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to set auth token:', err);
  }
}

/**
 * Get the stored refresh token.
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (err) {
    console.error('Failed to get refresh token:', err);
    return null;
  }
}

/**
 * Store the refresh token.
 */
export async function setRefreshToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to set refresh token:', err);
  }
}

/**
 * Clear all stored auth tokens.
 */
export async function clearAuthTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (err) {
    console.error('Failed to clear auth tokens:', err);
  }
}

/**
 * Check if user is authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}
