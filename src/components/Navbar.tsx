"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ApolloError } from "@apollo/client";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  const handleAuthClick = async () => {
    try {
      if (isLoggedIn) {
        await logout();
        setIsLoggedIn(false);
        router.push("/");
      } else {
        router.push("/login");
      }
    } catch (err) {
      if (err instanceof ApolloError) {
        console.error("Apollo Error:", err);
        setError(
          "An error occurred with the authentication service. Please try again later."
        );
      } else {
        console.error("Unexpected Error:", err);
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          Drone Pilot Quiz
        </Link>
        <div className="hidden md:flex space-x-4">
          <Link href="/" className="text-white hover:text-gray-300">
            Home
          </Link>
          <Link href="/quiz" className="text-white hover:text-gray-300">
            Start Quiz
          </Link>
          <Link
            href="/study-materials"
            className="text-white hover:text-gray-300"
          >
            Study Materials
          </Link>
          <Link href="/faq" className="text-white hover:text-gray-300">
            FAQ
          </Link>
          <button
            onClick={handleAuthClick}
            className="text-white hover:text-gray-300 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors duration-300"
          >
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        </div>
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <Link
            href="/"
            className="block text-white py-2 px-4 hover:bg-gray-700"
          >
            Home
          </Link>
          <Link
            href="/quizzes"
            className="block text-white py-2 px-4 hover:bg-gray-700"
          >
            Quizzes
          </Link>
          <button
            onClick={handleAuthClick}
            className="block text-white py-2 px-4 hover:bg-gray-700 w-full text-left"
          >
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        </div>
      )}
      {error && (
        <div className="bg-red-500 text-white p-2 text-center">{error}</div>
      )}
    </nav>
  );
}
