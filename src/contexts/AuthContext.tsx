import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useCurrentUser, useLogin, useRegister, useLogout } from "@/hooks/useAuth";
import { authApi, getApiError, type User, type LoginRequest, type RegisterRequest } from "@/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLandlord: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  const {
    data: user,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useCurrentUser();

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const isAuthenticated = !!user;
  const isLandlord = !!user && (user.role === "LANDLORD" || user.role === "BOTH" || user.role === "ADMIN");

  const login = async (data: LoginRequest) => {
    setError(null);
    try {
      await loginMutation.mutateAsync(data);
      await refetchUser();
    } catch (err) {
      setError(getApiError(err).message || "Login failed");
      throw err;
    }
  };

  const register = async (data: RegisterRequest) => {
    setError(null);
    try {
      // True when the user is signed in right away (email confirmation
      // disabled); false when a verification email was sent.
      const sessionCreated = await registerMutation.mutateAsync(data);
      if (sessionCreated) {
        // Mirror the fresh profile into the backend (best-effort).
        try {
          await authApi.syncProfile();
        } catch {
          // ignore — the profile row can be synced on the next update
        }
        await refetchUser();
      }
      return sessionCreated;
    } catch (err) {
      setError(getApiError(err).message || "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    logoutMutation.mutate();
    setError(null);
  };

  const isLoading =
    isLoadingUser || loginMutation.isPending || registerMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated,
        isLandlord,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
