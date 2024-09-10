'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gql, useQuery, useMutation } from '@apollo/client';

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

const CREATE_QUESTION = gql`
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      id
      prompt
      questionText
      answers
      correctAnswer
    }
  }
`;

export default function ManagementPage() {
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_CURRENT_USER);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [createQuestion] = useMutation(CREATE_QUESTION);

  useEffect(() => {
    if (data && data.me) {
      setCurrentUser(data.me);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!currentUser) return null;

  const canManageAdmins = currentUser.role === 'SUPER_ADMIN';
  const canManageEditors = ['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role);
  const canManageQuestions = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(currentUser.role);

  const handleCreateQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const prompt = (form.elements.namedItem('prompt') as HTMLInputElement).value;
    const questionText = (form.elements.namedItem('questionText') as HTMLInputElement).value;
    const answers = (form.elements.namedItem('answers') as HTMLInputElement).value.split(',').map(a => a.trim());
    const correctAnswer = (form.elements.namedItem('correctAnswer') as HTMLInputElement).value;

    try {
      await createQuestion({
        variables: {
          input: {
            prompt,
            questionText,
            answers,
            correctAnswer,
          },
        },
      });
      alert('Question added successfully');
      form.reset();
    } catch (err) {
      alert('Error adding question');
      console.error(err);
    }
  };

  const handleLogout = () => {
    // Clear the token (assuming it's stored in localStorage or cookies)
    localStorage.removeItem('token'); // Or use cookies if that's how you're managing tokens

    // Redirect to login page
    router.push('/login');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Management Dashboard</h1>
      <p className="mb-4">Welcome, {currentUser.username} ({currentUser.role})</p>

      <button onClick={handleLogout} className="mb-4 p-2 bg-red-500 text-white rounded hover:bg-red-600">
        Logout
      </button>

      {canManageAdmins && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Manage Admins</h2>
          <p>As a Super Admin, you can add or remove other admins here.</p>
        </section>
      )}

      {canManageEditors && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Manage Editors</h2>
          <p>You can add or remove editors here.</p>
        </section>
      )}

      {canManageQuestions && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Manage Questions</h2>
          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <input type="text" name="prompt" placeholder="Prompt" required className="w-full p-2 border rounded" />
            <input type="text" name="questionText" placeholder="Question Text" required className="w-full p-2 border rounded" />
            <input type="text" name="answers" placeholder="Answers (comma-separated)" required className="w-full p-2 border rounded" />
            <input type="text" name="correctAnswer" placeholder="Correct Answer" required className="w-full p-2 border rounded" />
            <button type="submit" className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600">
              Create Question
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
