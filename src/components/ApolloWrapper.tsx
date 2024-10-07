// src/components/ApolloWrapper.tsx
"use client";

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { ReactNode, useMemo } from "react";
import { AuthProvider } from "../contexts/AuthContext";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/v1/graphql",
});

const authLink = setContext((_, { headers }) => {
  // Only access localStorage on the client side
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      if (
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("unauthenticated")
      ) {
        // Handle unauthorized errors only on the client side
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    });
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const client = useMemo(
    () =>
      new ApolloClient({
        link: from([errorLink, authLink, httpLink]),
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: "network-only",
            nextFetchPolicy: "cache-first",
            errorPolicy: "all",
          },
          query: {
            fetchPolicy: "network-only",
            errorPolicy: "all",
          },
          mutate: {
            errorPolicy: "all",
          },
        },
      }),
    []
  );

  return (
    <ApolloProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
}
