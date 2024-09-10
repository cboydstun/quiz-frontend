'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gql, useQuery, useMutation } from '@apollo/client';

// # Get current user (requires authentication) ✅

// ```gql
// query Me {
//   me {
//     id
//     username
//     email
//     role
//   }
// }
// ```
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

// # Get all questions ✅

// ```gql
// query AllQuestions {
//   questions {
//     id
//     prompt
//     questionText
//     answers
//     correctAnswer
//     createdBy {
//       id
//       username
//     }
//   }
// }
// ```
const GET_QUIZ_QUESTIONS = gql`
    query GetQuizQuestions {
        questions {
        id
        prompt
        questionText
        answers
        }
    }
`;

const SUBMIT_QUIZ_ANSWERS = gql`
  mutation SubmitQuizAnswers($answers: [AnswerInput!]!) {
    submitQuizAnswers(answers: $answers) {
      score
      totalQuestions
    }
  }
`;

interface Question {
  id: string;
  prompt: string;
  questionText: string;
  answers: string[];
}

export default function QuizPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{ score: number; totalQuestions: number } | null>(null);

  const { loading: userLoading, error: userError, data: userData } = useQuery(GET_CURRENT_USER);
  const { loading: questionsLoading, error: questionsError, data: questionsData } = useQuery(GET_QUIZ_QUESTIONS);
  const [submitQuizAnswers] = useMutation(SUBMIT_QUIZ_ANSWERS);

  useEffect(() => {
    if (userData && userData.me) {
      setCurrentUser(userData.me);
      if (userData.me.role !== 'USER') {
        router.push('/');
      }
    }
  }, [userData, router]);

  if (userLoading || questionsLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;
  if (questionsError) return <p>Error: {questionsError.message}</p>;
  if (!currentUser || !questionsData) return null;

  const questions: Question[] = questionsData.questions;

  const handleAnswerSelection = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const answers = Object.entries(userAnswers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    try {
      const { data } = await submitQuizAnswers({ variables: { answers } });
      setQuizSubmitted(true);
      setQuizScore(data.submitQuizAnswers);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('There was an error submitting your quiz. Please try again.');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (quizSubmitted) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Quiz Completed</h1>
        <p className="mb-4">Thank you for completing the quiz, {currentUser.username}!</p>
        {quizScore && (
          <p className="text-lg">
            Your score: {quizScore.score} out of {quizScore.totalQuestions}
          </p>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Drone Pilot Quiz</h1>
      <p className="mb-4">Welcome, {currentUser.username}!</p>
      <div className="mb-4">
        <p className="font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <p className="text-lg mb-2">{currentQuestion.prompt}</p>
        <p className="text-xl mb-4">{currentQuestion.questionText}</p>
        <div className="space-y-2">
          {currentQuestion.answers.map((answer, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={answer}
                checked={userAnswers[currentQuestion.id] === answer}
                onChange={() => handleAnswerSelection(currentQuestion.id, answer)}
                className="form-radio"
              />
              <span>{answer}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}