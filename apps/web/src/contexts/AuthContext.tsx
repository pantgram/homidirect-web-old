import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useCurrentUser, useLogin, useRegister, useLogout } from "@/hooks/useAuth";
import { authApi, type User, type LoginRequest, type RegisterRequest } from "@/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLandlord: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
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

  const isAuthenticated = authApi.isAuthenticated() && !!user;
  const isLandlord = !!user && (user.role === "LANDLORD" || user.role === "BOTH" || user.role === "ADMIN");

  const login = async (data: LoginRequest) => {
    setError(null);
    try {
      await loginMutation.mutateAsync(data);
      await refetchUser();
    } catch (err: any) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      throw err;
    }
  };

  const register = async (data: RegisterRequest) => {
    setError(null);
    try {
      await registerMutation.mutateAsync(data);
      await refetchUser();
    } catch (err: any) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
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
