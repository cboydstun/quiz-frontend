'use client'
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
      <Link href="/" className="text-white text-xl font-bold">
  Drone Pilot Quiz
</Link>
<div className="hidden md:flex space-x-4">
  <Link href="/" className="text-white hover:text-gray-300">Home</Link>
  <Link href="/quiz" className="text-white hover:text-gray-300">Start Quiz</Link>
  <Link href="/study-materials" className="text-white hover:text-gray-300">Study Materials</Link>
  <Link href="/faq" className="text-white hover:text-gray-300">FAQ</Link>
</div>
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <Link href="/" className="block text-white py-2 px-4 hover:bg-gray-700">Home</Link>
          <Link href="/quizzes" className="block text-white py-2 px-4 hover:bg-gray-700">Quizzes</Link>
        </div>
      )}
    </nav>
  );
}