"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gql, useQuery, useMutation } from "@apollo/client";

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

const GET_QUIZ_QUESTIONS = gql`
  query GetQuizQuestions {
    questions {
      id
      prompt
      questionText
      answers
      hint
    }
  }
`;

const SUBMIT_ANSWER = gql`
  mutation SubmitAnswer($questionId: ID!, $selectedAnswer: String!) {
    submitAnswer(questionId: $questionId, selectedAnswer: $selectedAnswer) {
      success
      isCorrect
    }
  }
`;

interface Question {
  id: string;
  prompt: string;
  questionText: string;
  answers: string[];
  hint?: string;
}

type Difficulty = "EASY" | "MEDIUM" | "HARD";

export default function QuizPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{
    score: number;
    totalQuestions: number;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(GET_CURRENT_USER);
  const {
    loading: questionsLoading,
    error: questionsError,
    data: questionsData,
  } = useQuery(GET_QUIZ_QUESTIONS);
  const [submitAnswer] = useMutation(SUBMIT_ANSWER);

  useEffect(() => {
    if (userData && userData.me) {
      setCurrentUser(userData.me);
      if (userData.me.role !== "USER") {
        router.push("/");
      }
    }
  }, [userData, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (difficulty === "MEDIUM" || difficulty === "HARD") {
      const time = difficulty === "MEDIUM" ? 120 : 30;
      setTimeRemaining(time);
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime === 1) {
            clearInterval(timer);
            handleNextQuestion();
            return null;
          }
          return prevTime ? prevTime - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [difficulty, currentQuestionIndex]);

  if (userLoading || questionsLoading) return <p>Loading...</p>;
  if (userError) return <p>Error: {userError.message}</p>;
  if (questionsError) return <p>Error: {questionsError.message}</p>;
  if (!currentUser || !questionsData) return null;

  const questions: Question[] = questionsData.questions;

  const handleDifficultySelection = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setTimeRemaining(
      selectedDifficulty === "MEDIUM"
        ? 120
        : selectedDifficulty === "HARD"
        ? 30
        : null
    );
  };

  const handleAnswerSelection = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowHint(false);
      if (difficulty === "MEDIUM") {
        setTimeRemaining(120);
      } else if (difficulty === "HARD") {
        setTimeRemaining(30);
      }
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowHint(false);
      if (difficulty === "MEDIUM") {
        setTimeRemaining(120);
      } else if (difficulty === "HARD") {
        setTimeRemaining(30);
      }
    }
  };

  const handleSubmitQuiz = async () => {
    let score = 0;
    const totalQuestions = Object.keys(userAnswers).length;

    try {
      for (const [questionId, selectedAnswer] of Object.entries(userAnswers)) {
        const { data } = await submitAnswer({
          variables: { questionId, selectedAnswer },
        });
        if (data.submitAnswer.isCorrect) {
          score++;
        }
      }

      setQuizSubmitted(true);
      setQuizScore({ score, totalQuestions });
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("There was an error submitting your quiz. Please try again.");
    }
  };

  const renderDifficultySelection = () => (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to the Drone Pilot Quiz
      </h1>
      <p className="mb-4">
        Hello, {currentUser.username}! Please select a difficulty level to
        begin:
      </p>
      <div className="space-y-4">
        {(["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => handleDifficultySelection(level)}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {level}
          </button>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Difficulty Levels:</h2>
        <ul className="list-disc list-inside">
          <li>
            EASY: No timer, prompt provided, optional hint can be displayed
          </li>
          <li>
            MEDIUM: 120 second timer per question, no prompt provided, optional
            hint can be displayed
          </li>
          <li>
            HARD: 30 second timer, question and multiple choice answers only
          </li>
        </ul>
      </div>
    </div>
  );

  const renderQuizCompleted = () => (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz Completed</h1>
      <p className="mb-4">
        Thank you for completing the {difficulty} quiz, {currentUser.username}!
      </p>
      {quizScore && (
        <p className="text-lg">
          Your score: {quizScore.score} out of {quizScore.totalQuestions}
        </p>
      )}
      <button
        onClick={() => {
          setDifficulty(null);
          setCurrentQuestionIndex(0);
          setUserAnswers({});
          setQuizSubmitted(false);
          setQuizScore(null);
          setTimeRemaining(null);
          setShowHint(false);
        }}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Take Another Quiz
      </button>
    </div>
  );

  const renderQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          Drone Pilot Quiz - {difficulty} Level
        </h1>
        <p className="mb-4">Welcome, {currentUser.username}!</p>
        {timeRemaining !== null && (
          <p className="text-lg font-bold mb-4">
            Time Remaining: {timeRemaining} seconds
          </p>
        )}
        <div className="mb-4">
          <p className="font-semibold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          {difficulty !== "HARD" && (
            <p className="text-lg mb-2">{currentQuestion.prompt}</p>
          )}
          <p className="text-xl mb-4">{currentQuestion.questionText}</p>
          <div className="space-y-2">
            {currentQuestion.answers.map((answer, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={answer}
                  checked={userAnswers[currentQuestion.id] === answer}
                  onChange={() =>
                    handleAnswerSelection(currentQuestion.id, answer)
                  }
                  className="form-radio"
                />
                <span>{answer}</span>
              </label>
            ))}
          </div>
        </div>
        {difficulty !== "HARD" && currentQuestion.hint && (
          <div className="mb-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              {showHint ? "Hide Hint" : "Show Hint"}
            </button>
            {showHint && (
              <p className="mt-2 text-gray-600">{currentQuestion.hint}</p>
            )}
          </div>
        )}
        <div className="flex justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNextQuestion}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {currentQuestionIndex === questions.length - 1
              ? "Submit Quiz"
              : "Next"}
          </button>
        </div>
      </div>
    );
  };

  if (!difficulty) {
    return renderDifficultySelection();
  }

  if (quizSubmitted) {
    return renderQuizCompleted();
  }

  return renderQuestion();
}
