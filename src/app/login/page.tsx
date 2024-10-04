"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { gql, useMutation, useLazyQuery, ApolloError } from "@apollo/client";
import { useAuth } from "../../contexts/AuthContext";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`;

const GET_GOOGLE_AUTH_URL = gql`
  query GetGoogleAuthUrl {
    getGoogleAuthUrl {
      url
    }
  }
`;

const AUTHENTICATE_WITH_GOOGLE = gql`
  mutation AuthenticateWithGoogle($code: String!) {
    authenticateWithGoogle(code: $code) {
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, loading: authLoading, login: authLogin } = useAuth();

  const [login] = useMutation(LOGIN_MUTATION);
  const [getGoogleAuthUrl] = useLazyQuery(GET_GOOGLE_AUTH_URL);
  const [authenticateWithGoogle] = useMutation(AUTHENTICATE_WITH_GOOGLE);

  const redirectBasedOnRole = useCallback(
    (role: string) => {
      switch (role) {
        case "SUPER_ADMIN":
        case "ADMIN":
        case "EDITOR":
          router.push("/management");
          break;
        case "USER":
          router.push("/quiz");
          break;
        default:
          setError("Invalid user role");
      }
    },
    [router, setError]
  );

  const handleAuthenticationSuccess = (authData: {
    token: string;
    user: { role: string };
  }) => {
    redirectBasedOnRole(authData.user.role);
  };

  const handleGoogleAuthentication = useCallback(
    async (code: string) => {
      try {
        const { data } = await authenticateWithGoogle({ variables: { code } });
        await authLogin(data.authenticateWithGoogle.token);
        handleAuthenticationSuccess(data.authenticateWithGoogle);
      } catch (err: unknown) {
        let errorMessage = "Google authentication failed. Please try again.";
        if (err instanceof ApolloError && err.graphQLErrors.length > 0) {
          errorMessage = err.graphQLErrors[0].message;
        }
        setError(errorMessage);
      }
    },
    [authenticateWithGoogle, authLogin, setError, handleAuthenticationSuccess]
  );

  useEffect(() => {
    if (!authLoading && user) {
      redirectBasedOnRole(user.role);
    }
  }, [authLoading, user, redirectBasedOnRole]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      handleGoogleAuthentication(code);
    }
  }, [handleGoogleAuthentication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const result = await login({ variables: { email, password } });
      if (result.data && result.data.login) {
        await authLogin(result.data.login.token);
        handleAuthenticationSuccess(result.data.login);
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    } catch (err: unknown) {
      if (err instanceof ApolloError && err.graphQLErrors.length > 0) {
        setError(err.graphQLErrors[0].message);
      } else if (err instanceof Error) {
        setError(err.message || "An error occurred. Please try again.");
      } else {
        setError("An unknown error occurred. Please try again.");
      }
      console.error(err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data } = await getGoogleAuthUrl();
      window.location.href = data.getGoogleAuthUrl.url;
    } catch (err: unknown) {
      setError("Failed to initiate Google Sign-In. Please try again.");
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return null; // The useEffect hook will handle the redirection
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl transform transition-all hover:scale-105">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            >
              <Image
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                width={20}
                height={20}
                className="mr-2"
              />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
