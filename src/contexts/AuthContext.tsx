"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    // Check authentication status with API
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth");
        const data = await response.json();

        if (data.authenticated && data.user) {
          setUser(data.user);
        } else if (path !== "/register") {
          // Not authenticated, redirect to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        if (path !== "/register") {
          router.push("/login");
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router, path]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Call logout API to clear the HTTP-only cookie
      await fetch("/api/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }

    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
}
