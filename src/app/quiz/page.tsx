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
      points
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
  points: number;
}

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type QuestionCount = 10 | 20 | 50 | 100 | 200 | "infinite";

export default function QuizPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{
    score: number;
    totalQuestions: number;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);

  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(GET_CURRENT_USER, {
    onError: (error) => {
      // If there's an authentication error, redirect to login
      if (error.message.includes("Authorization header must be provided")) {
        router.push("/login");
      }
    },
  });

  const {
    loading: questionsLoading,
    error: questionsError,
    data: questionsData,
  } = useQuery(GET_QUIZ_QUESTIONS);
  const [submitAnswer] = useMutation(SUBMIT_ANSWER);

  useEffect(() => {
    if (!userLoading) {
      if (!userData?.me) {
        // If user data is loaded but there's no user, redirect to login
        router.push("/login");
      } else {
        setCurrentUser(userData.me);
      }
    }
  }, [userData, userLoading, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (difficulty === "MEDIUM" || difficulty === "HARD") {
      const time = difficulty === "MEDIUM" ? 60 : 30;
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
  if (questionsError)
    return <p>Error loading questions. Please try again later.</p>;
  if (!userData?.me || !questionsData) return null;

  const allQuestions: Question[] = questionsData.questions;
  const questions =
    questionCount === "infinite"
      ? allQuestions
      : allQuestions.slice(0, questionCount);

  const handleDifficultySelection = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setTimeRemaining(
      selectedDifficulty === "MEDIUM"
        ? 60
        : selectedDifficulty === "HARD"
        ? 30
        : null
    );
  };

  const handleQuestionCountSelection = (count: QuestionCount) => {
    setQuestionCount(count);
  };

  const handleAnswerSelection = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
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

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowHint(false);
      resetTimer();
    }
  };

  const resetTimer = () => {
    if (difficulty === "MEDIUM") {
      setTimeRemaining(60);
    } else if (difficulty === "HARD") {
      setTimeRemaining(30);
    }
  };

  const handleNextQuestion = () => {
    const currentQuestionId = questions[currentQuestionIndex].id;
    if (userAnswers[currentQuestionId]) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setShowHint(false);
        resetTimer();
      } else {
        handleSubmitQuiz();
      }
    } else {
      alert("Please select an answer before moving to the next question.");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowHint(false);
      resetTimer();
    }
  };

  const handleQuit = () => {
    setShowQuitConfirmation(true);
  };

  const confirmQuit = () => {
    setDifficulty(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setTimeRemaining(null);
    setShowHint(false);
    setShowQuitConfirmation(false);
  };

  const renderDifficultySelection = () => (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">
        Welcome to the Drone Pilot Quiz
      </h1>
      <p className="mb-8 text-xl text-center text-gray-700">
        Hello, <span className="font-semibold">{userData.me.username}</span>!
        Please select a difficulty level and the number of questions:
      </p>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Number of Questions: {questionCount}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {([10, 20, 50, 100, 200, "infinite"] as QuestionCount[]).map(
            (count) => (
              <button
                key={count}
                onClick={() => handleQuestionCountSelection(count)}
                className={`py-2 px-4 rounded-lg font-bold text-white transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                  questionCount === count
                    ? "ring-4 ring-blue-500 bg-blue-600"
                    : "bg-purple-500 hover:bg-purple-600 focus:ring-purple-300"
                }`}
              >
                {count === "infinite" ? "Infinite" : count}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => handleDifficultySelection(level)}
            className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
              difficulty === level
                ? "ring-4 ring-blue-500"
                : level === "EASY"
                ? "bg-green-500 hover:bg-green-600 focus:ring-green-300"
                : level === "MEDIUM"
                ? "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300"
                : "bg-red-500 hover:bg-red-600 focus:ring-red-300"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      <div className="bg-gray-100 rounded-lg p-6 shadow-md mt-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Difficulty Levels:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              level: "EASY",
              color: "text-green-600",
              bgColor: "bg-green-100",
              description:
                "No timer. Full text prompt provided. Multiple choice question and answers. Optional hint can be displayed.",
            },
            {
              level: "MEDIUM",
              color: "text-yellow-600",
              bgColor: "bg-yellow-100",
              description:
                "60 second timer per question. No prompt provided - just question and answers. Optional hint can be displayed.",
            },
            {
              level: "HARD",
              color: "text-red-600",
              bgColor: "bg-red-100",
              description:
                "30 second timer. Question and multiple choice answers only. No hint available.",
            },
          ].map(({ level, color, bgColor, description }) => (
            <div
              key={level}
              className={`${bgColor} rounded-lg p-4 flex flex-col`}
            >
              <span className={`font-bold ${color} text-lg mb-2`}>{level}</span>
              <span className="text-gray-700 text-sm">{description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuizCompleted = () => (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz Completed</h1>
      <p className="mb-4">
        Thank you for completing the {difficulty} quiz, {userData.me.username}!
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
    const isAnswered = userAnswers[currentQuestion.id] !== undefined;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          Drone Pilot Quiz - {difficulty} Level
        </h1>
        <p className="mb-4">Welcome, {userData.me.username}!</p>
        {timeRemaining !== null && (
          <p className="text-lg font-bold mb-4">
            Time Remaining: {timeRemaining} seconds
          </p>
        )}
        <div className="mb-4">
          <p className="font-semibold">
            Question {currentQuestionIndex + 1} of{" "}
            {questionCount === "infinite" ? "∞" : questionCount}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            This question is worth {currentQuestion.points} points
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
        <div className="flex justify-between items-center">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleSkipQuestion}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          >
            Skip
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={!isAnswered}
            className={`font-bold py-2 px-4 rounded ${
              isAnswered
                ? "bg-blue-500 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLastQuestion ? "Submit Quiz" : "Next"}
          </button>
        </div>
        <div className="mt-4">
          <button
            onClick={handleQuit}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Quit Quiz
          </button>
        </div>
      </div>
    );
  };

  const renderQuitConfirmation = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">
          Are you sure you want to quit?
        </h2>
        <p className="mb-6">Your progress will be lost if you quit now.</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowQuitConfirmation(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={confirmQuit}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );

  if (!difficulty || !questionCount) {
    return renderDifficultySelection();
  }

  if (quizSubmitted) {
    return renderQuizCompleted();
  }

  return (
    <>
      {renderQuestion()}
      {showQuitConfirmation && renderQuitConfirmation()}
    </>
  );
}
