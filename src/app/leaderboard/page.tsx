"use client";

import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_LEADERBOARD = gql`
  query GetLeaderboard($limit: Int) {
    getLeaderboard(limit: $limit) {
      leaderboard {
        position
        user {
          username
          email
          score
        }
        score
      }
      currentUserEntry {
        position
        user {
          username
          email
          score
        }
        score
      }
    }
  }
`;

export default function LeaderboardPage() {
  const [limit, setLimit] = useState(10);
  const { loading, error, data } = useQuery(GET_LEADERBOARD, {
    variables: { limit },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { leaderboard, currentUserEntry } = data.getLeaderboard;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

      <div className="bg-white shadow rounded-lg mb-8">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Top Players</h2>
        </div>
        <div className="p-4">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left font-medium">Position</th>
                <th className="px-4 py-2 text-left font-medium">Username</th>
                <th className="px-4 py-2 text-left font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry: { position: number; user: { username: string; email: string; score: number }; score: number }) => (
                <tr key={entry.position} className="border-b">
                  <td className="px-4 py-2">{entry.position}</td>
                  <td className="px-4 py-2">{entry.user.username}</td>
                  <td className="px-4 py-2">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {currentUserEntry && (
        <div className="bg-white shadow rounded-lg">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Your Position</h2>
          </div>
          <div className="p-4">
            <p className="mb-2">Position: {currentUserEntry.position}</p>
            <p>Score: {currentUserEntry.score}</p>
          </div>
        </div>
      )}

      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => setLimit((prev) => prev + 10)}
      >
        Load More
      </button>
    </div>
  );
}
