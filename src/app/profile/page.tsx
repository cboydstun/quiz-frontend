"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, gql, ApolloError } from "@apollo/client";

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
      id
      username
      email
      role
      score
      questionsAnswered
      questionsCorrect
      questionsIncorrect
      skills
      lifetimePoints
      yearlyPoints
      monthlyPoints
      dailyPoints
      consecutiveLoginDays
      lastLoginDate
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_USERNAME = gql`
  mutation UpdateUsername($username: String!) {
    updateUsername(username: $username) {
      id
      username
    }
  }
`;

const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!) {
    updatePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      success
      message
    }
  }
`;

const UPDATE_LOGIN_STREAK = gql`
  mutation UpdateLoginStreak($userId: ID!) {
    updateLoginStreak(userId: $userId) {
      id
      consecutiveLoginDays
      lastLoginDate
    }
  }
`;

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const { loading, error, data, refetch } = useQuery(GET_USER_PROFILE);
  const [updateUsername] = useMutation(UPDATE_USERNAME);
  const [updatePassword] = useMutation(UPDATE_PASSWORD);
  const [updateLoginStreak] = useMutation(UPDATE_LOGIN_STREAK);

  useEffect(() => {
    if (data?.me?.id) {
      updateLoginStreak({
        variables: { userId: data.me.id },
        update: (cache, { data: updatedData }) => {
          if (updatedData?.updateLoginStreak) {
            cache.modify({
              fields: {
                me(existingMe = {}) {
                  return { ...existingMe, ...updatedData.updateLoginStreak };
                },
              },
            });
          }
        },
      });
    }
  }, [data?.me?.id, updateLoginStreak]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <p className="text-center text-xl text-red-500">
            Error: {error.message}
          </p>
        </div>
      </div>
    );

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateUsername({
        variables: { username },
        update: (cache, { data }) => {
          const updatedUser = data?.updateUsername;
          if (updatedUser) {
            cache.modify({
              fields: {
                me(existingMe = {}) {
                  return { ...existingMe, ...updatedUser };
                },
              },
            });
          }
        },
      });
      setMessage("Username updated successfully: " + result);
      setUsername("");
      refetch();
    } catch (err) {
      setMessage("Failed to update username");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }
    try {
      const result = await updatePassword({
        variables: { currentPassword, newPassword },
      });
      setMessage(result.data.updatePassword.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage("Failed to update password");
    }
  };

  const formatDate = (
    timestamp: string | number | null | undefined
  ): string => {
    if (!timestamp) return "N/A";
    const date = new Date(
      typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp
    );

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderQuestionsAnswered = () => {
    if (loading) {
      return <p className="text-3xl font-bold text-green-700">Loading...</p>;
    }
    if (error) {
      return <p className="text-xl text-red-500">Error loading data</p>;
    }
    if (data?.me?.questionsAnswered === undefined) {
      return <p className="text-xl text-yellow-500">Data not available</p>;
    }
    return (
      <p className="text-3xl font-bold text-green-700">
        {data.me.questionsAnswered}
      </p>
    );
  };

  console.log("// profile page questionsAnswered", data?.me?.questionsAnswered);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as ApolloError).message}</div>;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">
          Profile Management
        </h1>

        {message && (
          <div
            className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8 rounded-lg transition-all duration-300 transform hover:scale-105"
            role="alert"
          >
            <p>{message}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-lg p-6 transition-all duration-300 transform hover:scale-105">
            <h2 className="text-2xl font-semibold mb-6 text-blue-600">
              Update Profile
            </h2>
            <form onSubmit={handleUsernameUpdate} className="mb-8">
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
              >
                Update Username
              </button>
            </form>

            <form onSubmit={handlePasswordUpdate}>
              <div className="mb-4">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
              >
                Update Password
              </button>
            </form>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 transition-all duration-300 transform hover:scale-105">
            <h2 className="text-2xl font-semibold mb-6 text-blue-600">
              Your Progress
            </h2>
            {data && data.me && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-blue-600">
                      Total Score
                    </h3>
                    <p className="text-3xl font-bold text-blue-700">
                      {data.me.score}
                    </p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-green-600">
                      Questions Answered
                    </h3>
                    {renderQuestionsAnswered()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-purple-600">
                      Correct Answers
                    </h3>
                    <p className="text-3xl font-bold text-purple-700">
                      {data.me.questionsCorrect}
                    </p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-red-600">
                      Incorrect Answers
                    </h3>
                    <p className="text-3xl font-bold text-red-700">
                      {data.me.questionsIncorrect}
                    </p>
                  </div>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-yellow-600">
                    Badges
                  </h3>
                  <p className="text-gray-700">{data.me.skills.join(", ")}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-indigo-600">
                      Login Streak
                    </h3>
                    <p className="text-3xl font-bold text-indigo-700">
                      {data?.me?.consecutiveLoginDays || 0} days
                    </p>
                  </div>
                  <div className="bg-pink-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-pink-600">
                      Last Login
                    </h3>
                    <p className="text-sm text-pink-700">
                      {formatDate(data?.me?.lastLoginDate)}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-600">
                    Account Details
                  </h3>
                  <p className="text-sm text-gray-700">
                    Created: {new Date(data.me.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700">
                    Last Updated: {new Date(data.me.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
