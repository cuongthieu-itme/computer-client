import { create } from 'zustand';
import axios, { AxiosError } from 'axios'; // Import AxiosError for better error handling
import { AuthState, AuthActions, AuthStore } from '@/types/store/auth.store';
import { UserDTO, RefreshTokenResponseDTO, ApiErrorDTO } from '@/types/api/auth.api'; // Removed RefreshTokenRequestDTO as it's not used for header-based refresh
import apiClient from '@/lib/apiClient';
import { config } from '@/config/env';

// Initial state of the authentication store
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true, // Start with isLoading: true, as initialization is an async process
  error: null,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  /**
   * Logs in the user, updates state, localStorage, and apiClient headers.
   * @param userData - The user data object.
   * @param accessToken - The new access token.
   * @param refreshToken - The new refresh token.
   */
  login: (userData: UserDTO, accessToken: string, refreshToken: string) => {

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    set({
      user: userData,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false, // Login action implies loading is complete for this operation
      error: null,
    });

  },

  /**
   * Logs out the user, clears state, localStorage, and apiClient headers.
   */
  logout: () => {

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete apiClient.defaults.headers.common['Authorization'];
    set({
      ...initialState, // Reset to initial logged-out state
      isLoading: false, // Ensure isLoading is false after logout
    });

  },

  /**
   * Sets the loading state.
   * @param isLoading - Boolean indicating if loading.
   */
  setLoading: (isLoading: boolean) => set({ isLoading }),

  /**
   * Sets the error state.
   * @param error - Error message string or null.
   */
  setError: (error: string | null) => set({ error, isLoading: false }),

  /**
   * Updates the access token in state, localStorage, and apiClient.
   * @param newAccessToken - The new access token or null.
   */
  setAccessToken: (newAccessToken: string | null) => {
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
    } else {
      localStorage.removeItem('accessToken');
      delete apiClient.defaults.headers.common['Authorization'];
    }
    set({ accessToken: newAccessToken });

  },

  /**
   * Updates the refresh token in state and localStorage.
   * @param newRefreshToken - The new refresh token or null.
   */
  setRefreshToken: (newRefreshToken: string | null) => {
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
    set({ refreshToken: newRefreshToken });

  },

  /**
   * Updates the user object in the state.
   * @param userData - The user data object or null.
   */
  setUser: (userData: UserDTO | null) => set({ user: userData }),

  /**
   * Attempts to refresh the session using the stored refresh token.
   * This function makes a direct axios call.
   * The refresh endpoint expects the refreshToken as a Bearer token in the Authorization header
   * and NO request body.
   * @returns True if refresh was successful, false otherwise.
   */
  handleTokenRefresh: async (): Promise<boolean> => {

    const currentRefreshToken = get().refreshToken;

    if (!currentRefreshToken) {
      console.warn('AuthStore: No refresh token available for handleTokenRefresh.');
      if (get().isAuthenticated) {
        get().logout();
      } else {
        set({ isLoading: false, isAuthenticated: false, user: null, accessToken: null });
      }
      return false;
    }



    try {
      // Using a direct axios call to send the refreshToken in the Authorization header
      const response = await axios.post<RefreshTokenResponseDTO>(
        `${config.apiBaseUrl}/auth/refresh-token`,
        null, // Send null or an empty object if the backend expects no body
        {
          headers: {
            'Authorization': `Bearer ${currentRefreshToken}` // Use refreshToken as Bearer token
          }
        }
      );

      if (response.data && response.data.respCode === 2000 && response.data.result) {
        const { user, accessToken: newAccessToken, refreshToken: newRefreshTokenFromResponse } = response.data.result;
        get().login(user, newAccessToken, newRefreshTokenFromResponse || currentRefreshToken);

        return true;
      } else {
        const errorMsg = response.data?.respDesc || 'Token refresh failed with non-2000 response.';
        console.error(`AuthStore: Token refresh API error. RespCode: ${response.data?.respCode}, Desc: ${errorMsg}`);
        set({ error: `Session expired or invalid. ${errorMsg}` });
        get().logout();
        return false;
      }
    } catch (error) {
      let errorMsg = 'Token refresh API call failed catastrophically.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorDTO>;
        if (axiosError.response && axiosError.response.data) {
          errorMsg = axiosError.response.data.respDesc || axiosError.response.data.message || errorMsg;
          console.error(`AuthStore: Token refresh Axios error. Status: ${axiosError.response.status}, Data:`, axiosError.response.data);
        } else if (axiosError.request) {
          errorMsg = 'No response from server during token refresh.';
          console.error('AuthStore: Token refresh error - No response from server.');
        } else {
          errorMsg = axiosError.message;
          console.error('AuthStore: Token refresh error - Request setup issue:', axiosError.message);
        }
      } else {
        console.error('AuthStore: Non-Axios error during token refresh:', error);
      }
      set({ error: `Session refresh failed. ${errorMsg}` });
      get().logout();
      return false;
    }
  },

  /**
   * Initializes the authentication state when the application loads.
   * It checks for stored tokens and attempts to refresh the session.
   */
  initializeAuth: async () => {

    set({ isLoading: true, error: null });

    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedRefreshToken) {

      // Set refreshToken in store so handleTokenRefresh can access it.
      // AccessToken is also set for apiClient defaults if refresh is successful.
      get().setRefreshToken(storedRefreshToken);
      if (storedAccessToken) get().setAccessToken(storedAccessToken); // Set this so UI doesn't flicker to non-auth state too quickly if refresh is fast

      const refreshed = await get().handleTokenRefresh(); // This will now use refreshToken in header
      if (refreshed) {

      } else {

      }
    } else if (storedAccessToken) {
      // This path is less ideal if refreshTokens are the primary mechanism for session restoration.
      // If only an accessToken exists, a robust solution might involve trying to validate it
      // with a /me or /validate endpoint, or simply treating the session as expired.
      // For now, we'll set an optimistic state, but subsequent API calls might fail if the token is expired,
      // and the interceptor's refresh attempt will fail without a refreshToken.
      console.warn('AuthStore: Only access token found. Setting optimistic state. Session might be expired.');
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
      set({
        accessToken: storedAccessToken,
        isAuthenticated: true,
        user: null,
        isLoading: false,
        error: "Session might be expired; user data not loaded.",
      });
    } else {

      get().logout();
    }

    if (get().isLoading) {
      set({ isLoading: false });
    }

  },
}));

export default useAuthStore;
