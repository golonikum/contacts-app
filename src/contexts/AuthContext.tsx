"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/types/user";
import { verifyToken } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
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
    // Check for stored token and verify it
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = verifyToken(token);
        if (decoded) {
          setUser({
            id: decoded.id,
            email: decoded.email,
          });
        } else {
          // Invalid token, remove it and redirect to login
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        localStorage.removeItem("token");
        router.push("/login");
      }
    } else if (path !== "/register") {
      // No token, redirect to login
      router.push("/login");
    }

    setIsLoading(false);
  }, [router]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
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
