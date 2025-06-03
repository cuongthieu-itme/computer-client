import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import FullScreenLoader from '@/components/common/FullScreenLoader'; // Import the loader

interface ProtectedRouteProps {
  // roles?: string[]; // For future role-based access
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = (/*{ roles }*/) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoadingAuth = useAuthStore(state => state.isLoading); // Get loading state from store
  const location = useLocation();

  if (isLoadingAuth) {
    console.log("ProtectedRoute: Auth state is loading, showing FullScreenLoader.");
    return <FullScreenLoader />; // Show full-screen loader while auth state is being determined
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: User not authenticated, redirecting to login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional: Role-based access control logic would go here if implemented

  return <Outlet />; // User is authenticated, render the requested component
};

export default ProtectedRoute;
