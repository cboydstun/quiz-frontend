'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gql, useMutation, useLazyQuery } from '@apollo/client';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const [login] = useMutation(LOGIN_MUTATION);
  const [getGoogleAuthUrl] = useLazyQuery(GET_GOOGLE_AUTH_URL);
  const [authenticateWithGoogle] = useMutation(AUTHENTICATE_WITH_GOOGLE);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleGoogleAuthentication(code);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const { data } = await login({ variables: { email, password } });
      handleAuthenticationSuccess(data.login);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error(err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data } = await getGoogleAuthUrl();
      window.location.href = data.getGoogleAuthUrl.url;
    } catch (err: any) {
      setError('Failed to initiate Google Sign-In. Please try again.');
      console.error(err);
    }
  };

  const handleGoogleAuthentication = async (code: string) => {
    console.log("Received Google auth code:", code);
    try {
      const { data } = await authenticateWithGoogle({ variables: { code } });
      console.log("Google authentication response:", data);
      handleAuthenticationSuccess(data.authenticateWithGoogle);
    } catch (err: any) {
      console.error("Google authentication error:", err);
      let errorMessage = 'Google authentication failed. Please try again.';
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        errorMessage = err.graphQLErrors[0].message;
      }
      setError(errorMessage);
    }
  };

  const handleAuthenticationSuccess = (authData: { token: string; user: { role: string } }) => {
    localStorage.setItem('token', authData.token);
    
    switch (authData.user.role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
      case 'EDITOR':
        router.push('/management');
        break;
      case 'USER':
        router.push('/quiz');
        break;
      default:
        setError('Invalid user role');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Login to Drone Pilot Quiz</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        <div className="flex items-center justify-between mb-6">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Sign In
          </button>
          <Link
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Sign in with Google
          </button>
        </div>
      </form>
      <p className="text-center text-gray-500 text-xs">
        Don't have an account?{' '}
        <Link href="/register" className="text-blue-500 hover:text-blue-800">
          Register here
        </Link>
      </p>
    </div>
  );
}