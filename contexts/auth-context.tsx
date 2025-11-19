 "use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { loginWithEmail, loginWithGoogle, logout, subscribeToToken } from "@/lib/firebase-client";
import { Claims } from "@/lib/rbac";

type AuthContextValue = {
  firebaseUser: User | null;
  token: string | null;
  claims: Claims | null;
  loading: boolean;
  loginWithEmail: typeof loginWithEmail;
  loginWithGoogle: typeof loginWithGoogle;
  logout: typeof logout;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [claims, setClaims] = useState<Claims | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToToken(async (user, jwt) => {
      setFirebaseUser(user);
      setToken(jwt ?? null);
      setLoading(false);

      if (!jwt) {
        setClaims(null);
        return;
      }

      try {
        const response = await fetch("/api/auth/claims", {
          headers: { Authorization: `Bearer ${jwt}` }
        });
        if (!response.ok) throw new Error("Failed to fetch claims");
        const data = await response.json();
        setClaims(data.claims);
      } catch (error) {
        console.error("Failed to load claims", error);
        setClaims(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      token,
      claims,
      loading,
      loginWithEmail,
      loginWithGoogle,
      logout
    }),
    [firebaseUser, token, claims, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
