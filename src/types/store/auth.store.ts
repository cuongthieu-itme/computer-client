
import { UserDTO } from "../api/auth.api"; 

/**
 * Defines the shape of the authentication state.
 */
export interface AuthState {
    user: UserDTO | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Defines the actions available for managing authentication state.
 */
export interface AuthActions {
    login: (userData: UserDTO, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    initializeAuth: () => Promise<void>;
    setAccessToken: (accessToken: string | null) => void;
    setRefreshToken: (refreshToken: string | null) => void;
    setUser: (user: UserDTO | null) => void;
    /**
     * Attempts to refresh the session.
     * Relies on the accessToken currently in the store to be sent by apiClient.
     * Returns true on success, false on failure.
     */
    handleTokenRefresh: () => Promise<boolean>; // Updated: No longer takes currentRefreshToken as an argument
}

/**
 * Represents the complete authentication store, combining state and actions.
 */
export type AuthStore = AuthState & AuthActions;
