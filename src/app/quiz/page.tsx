"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type QuestionCount = 10 | 20 | 50 | 100 | 200 | "infinite";

export default function QuizPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  const { loading: userLoading, data: userData } = useQuery(GET_CURRENT_USER, {
    onError: (error) => {
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
        router.push("/login");
      } else {
        setCurrentUser(userData.me as User);
      }
    }
  }, [userData, userLoading, router]);

  const allQuestions: Question[] = questionsData?.questions || [];
  const questions = useMemo(() => {
    if (questionCount === "infinite") {
      return allQuestions;
    }
    return allQuestions.slice(0, questionCount);
  }, [allQuestions, questionCount]);

  const resetTimer = useCallback(() => {
    if (difficulty === "MEDIUM") {
      setTimeRemaining(60);
    } else if (difficulty === "HARD") {
      setTimeRemaining(30);
    }
  }, [difficulty]);

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

  const handleNextQuestion = useCallback(() => {
    if (questions.length === 0) return;

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
  }, [
    currentQuestionIndex,
    questions,
    userAnswers,
    resetTimer,
    handleSubmitQuiz,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (
      (difficulty === "MEDIUM" || difficulty === "HARD") &&
      timeRemaining !== null
    ) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime === null || prevTime <= 1) {
            if (timer) clearInterval(timer);
            handleNextQuestion();
            return null;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [difficulty, timeRemaining, handleNextQuestion]);

  if (userLoading || questionsLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  if (questionsError)
    return (
      <p className="text-center text-red-600 text-xl mt-8">
        Error loading questions. Please try again later.
      </p>
    );
  if (!userData?.me || questions.length === 0) return null;

  const handleDifficultySelection = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    if (selectedDifficulty === "MEDIUM") {
      setTimeRemaining(60);
    } else if (selectedDifficulty === "HARD") {
      setTimeRemaining(30);
    } else {
      setTimeRemaining(null);
    }
  };

  const handleQuestionCountSelection = (count: QuestionCount) => {
    setQuestionCount(count);
  };

  const handleAnswerSelection = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowHint(false);
      resetTimer();
    } else {
      handleSubmitQuiz();
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
                className={`py-2 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
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
            className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
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
      <div className="bg-white rounded-lg p-6 shadow-md mt-8">
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
              className={`${bgColor} rounded-lg p-4 flex flex-col transition-all duration-300 transform hover:scale-105`}
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
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Quiz Completed
        </h1>
        <p className="mb-6 text-xl text-center text-gray-700">
          Thank you for completing the {difficulty} quiz, {userData.me.username}
          !
        </p>
        {quizScore && (
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-green-600">
              Your score: {quizScore.score} out of {quizScore.totalQuestions}
            </p>
            <p className="text-lg text-gray-600">
              ({((quizScore.score / quizScore.totalQuestions) * 100).toFixed(2)}
              %)
            </p>
          </div>
        )}
        <div className="flex justify-center">
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Take Another Quiz
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuestion = () => {
    if (questions.length === 0) return null;

    const currentQuestion = questions[currentQuestionIndex];
    const isAnswered = userAnswers[currentQuestion.id] !== undefined;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="bg-white rounded-lg p-8 shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
            Drone Pilot Quiz - {difficulty} Level
          </h1>
          <p className="mb-6 text-xl text-center text-gray-700">
            Welcome, {userData.me.username}!
          </p>
          {timeRemaining !== null && (
            <p className="text-2xl font-bold mb-6 text-center text-red-600">
              Time Remaining: {timeRemaining} seconds
            </p>
          )}
          <div className="mb-8">
            <p className="font-semibold text-lg mb-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              This question is worth {currentQuestion.points} points
            </p>
            {difficulty !== "HARD" && (
              <p className="text-lg mb-4 text-gray-700">
                {currentQuestion.prompt}
              </p>
            )}
            <p className="text-xl mb-6 font-semibold">
              {currentQuestion.questionText}
            </p>
            <div className="space-y-4">
              {currentQuestion.answers.map((answer, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-100"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={answer}
                    checked={userAnswers[currentQuestion.id] === answer}
                    onChange={() =>
                      handleAnswerSelection(currentQuestion.id, answer)
                    }
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="text-lg">{answer}</span>
                </label>
              ))}
            </div>
          </div>
          {difficulty !== "HARD" && currentQuestion.hint && (
            <div className="mb-6">
              <button
                onClick={() => setShowHint(!showHint)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                {showHint ? "Hide Hint" : "Show Hint"}
              </button>
              {showHint && (
                <p className="mt-4 p-4 bg-yellow-100 rounded-lg text-gray-700">
                  {currentQuestion.hint}
                </p>
              )}
            </div>
          )}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {!isLastQuestion && (
              <button
                onClick={handleSkipQuestion}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNextQuestion}
              disabled={!isAnswered}
              className={`font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 ${
                isAnswered
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLastQuestion ? "Submit Quiz" : "Next"}
            </button>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={handleQuit}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Quit Quiz
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuitConfirmation = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Are you sure you want to quit?
        </h2>
        <p className="mb-6 text-gray-600">
          Your progress will be lost if you quit now.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowQuitConfirmation(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={confirmQuit}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300"
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12">
      {!difficulty || !questionCount ? (
        renderDifficultySelection()
      ) : quizSubmitted ? (
        renderQuizCompleted()
      ) : (
        <>
          {renderQuestion()}
          {showQuitConfirmation && renderQuitConfirmation()}
        </>
      )}
    </div>
  );
}
