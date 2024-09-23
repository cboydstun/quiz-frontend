// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { gql, useQuery, useApolloClient } from "@apollo/client";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null | undefined;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      username
      email
      role
    }
  }
`;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const client = useApolloClient();

  useEffect(() => {
    // Check for token in localStorage only on the client side
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(storedToken);
  }, []);

  const { loading, error, data, refetch } = useQuery(GET_CURRENT_USER, {
    skip: !token,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data && data.me) {
      setUser(data.me);
    }
  }, [data]);

  const login = (newToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken);
    }
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setToken(null);
    setUser(null);
    client.resetStore();
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
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
