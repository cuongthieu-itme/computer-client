import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface LocalStorageData {
  accessToken: string | null;
  refreshToken: string | null;

  designTheme: string | null;
}

const AuthDebugDisplay: React.FC = () => {
  const authState = useAuthStore((state) => state);
  const [localStorageData, setLocalStorageData] = useState<LocalStorageData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateLocalStorageData = () => {
      try {
        const data: LocalStorageData = {
          accessToken: localStorage.getItem("accessToken"),
          refreshToken: localStorage.getItem("refreshToken"),
          designTheme: localStorage.getItem("design-theme"),
        };
        setLocalStorageData(data);
      } catch (error) {
        console.error("Error reading from localStorage for debug display:", error);
        setLocalStorageData({
          accessToken: "Error reading token",
          refreshToken: "Error reading token",
          designTheme: "Error reading theme",
        });
      }
    };

    updateLocalStorageData();

    window.addEventListener("storage", updateLocalStorageData);

    const intervalId = setInterval(updateLocalStorageData, 2000);

    return () => {
      window.removeEventListener("storage", updateLocalStorageData);
      clearInterval(intervalId);
    };
  }, []);

  const {
    login,
    logout,
    setLoading,
    setError,
    initializeAuth,
    setAccessToken,
    setRefreshToken,
    setUser,
    handleTokenRefresh,
    ...displayableAuthState
  } = authState;

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-2 bg-gray-800 text-white text-xs max-h-[40vh] overflow-y-auto border-t-2 border-yellow-400">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="w-full text-left justify-between text-yellow-300 hover:text-yellow-200 hover:bg-gray-700 px-2 py-1 mb-1"
      >
        <span>Auth & LocalStorage Debug Info</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-gray-700 rounded">
          <div>
            <h4 className="font-semibold mb-1 text-yellow-400">Zustand Auth State:</h4>
            <pre className="whitespace-pre-wrap break-all bg-gray-600 p-1.5 rounded text-[10px] leading-snug max-h-[25vh] overflow-y-auto">
              {JSON.stringify(displayableAuthState, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-yellow-400">LocalStorage Snapshot:</h4>
            {localStorageData ? (
              <pre className="whitespace-pre-wrap break-all bg-gray-600 p-1.5 rounded text-[10px] leading-snug max-h-[25vh] overflow-y-auto">
                {JSON.stringify(localStorageData, null, 2)}
              </pre>
            ) : (
              <p>Loading localStorage data...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugDisplay;
