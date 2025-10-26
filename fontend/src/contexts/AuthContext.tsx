import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const response = await apiClient.getCurrentUser();
        if (response.data) {
          setUser(response.data);
        } else {
          localStorage.removeItem("auth_token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await apiClient.signIn({ email, password });
    if (response.error) {
      return { error: response.error };
    }
    if (response.data) {
      setUser(response.data.user);
    }
    return {};
  };

  const signUp = async (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  }) => {
    const response = await apiClient.signUp(data);
    if (response.error) {
      return { error: response.error };
    }
    if (response.data) {
      setUser(response.data.user);
    }
    return {};
  };

  const signOut = async () => {
    await apiClient.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
