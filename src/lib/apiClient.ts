import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { config } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import { ApiErrorDTO } from '@/types/api/auth.api';

// Queue for handling multiple failed requests due to token expiration
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const apiClient = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (axiosConfig: InternalAxiosRequestConfig) => {
        const accessToken = useAuthStore.getState().accessToken;
        if (accessToken && axiosConfig.headers) {
            axiosConfig.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosConfig;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorDTO>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Check for 401 Unauthorized and if we haven't retried this specific request yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, add this request to a queue to be retried later
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (originalRequest.headers) {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest); // Retry with new token
                }).catch(err => {
                    return Promise.reject(err); // Propagate error if queue processing fails
                });
            }

            originalRequest._retry = true; // Mark that we are retrying this request
            isRefreshing = true;


            try {
                const refreshSuccessful = await useAuthStore.getState().handleTokenRefresh();

                if (refreshSuccessful) {
                    const newAccessToken = useAuthStore.getState().accessToken;
                    if (originalRequest.headers) {
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    }
                    processQueue(null, newAccessToken); // Process queued requests with new token
                    return apiClient(originalRequest); // Retry the original request
                } else {
                    // handleTokenRefresh already calls logout, which clears state and localstorage.
                    processQueue(error, null); // Reject queued requests
                    // The user is logged out by handleTokenRefresh.
                    // Further actions like redirecting might be handled by components subscribing to auth state.
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                console.error('apiClient: Error during token refresh attempt.', refreshError);
                processQueue(refreshError as AxiosError, null); // Reject queued requests
                useAuthStore.getState().logout(); // Ensure logout if something unexpected happened
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        // For other errors, just pass them along
        return Promise.reject(error);
    }
);

export default apiClient;
