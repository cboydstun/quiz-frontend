"use client";

import { useState, useEffect } from "react";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

const GET_QUESTION_IDS = gql`
  query GetQuestionIds {
    questions {
      id
    }
  }
`;

const GET_QUESTION = gql`
  query GetQuestion($id: ID!) {
    question(id: $id) {
      id
      prompt
      questionText
      answers
      correctAnswer
      createdBy {
        id
        username
      }
    }
  }
`;

interface FlashCard {
  id: string;
  prompt: string;
  questionText: string;
  answers: string[];
  correctAnswer: string;
}

export default function FlashCardsPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [questionIds, setQuestionIds] = useState<string[]>([]);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    loading: idsLoading,
    error: idsError,
    data: idsData,
  } = useQuery(GET_QUESTION_IDS);
  const [getQuestion, { loading: questionLoading, error: questionError }] =
    useLazyQuery(GET_QUESTION);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (idsData && idsData.questions) {
      setQuestionIds(idsData.questions.map((q: { id: string }) => q.id));
    }
  }, [idsData]);

  useEffect(() => {
    if (
      questionIds.length > 0 &&
      currentCardIndex >= flashCards.length &&
      currentCardIndex < questionIds.length
    ) {
      getQuestion({ variables: { id: questionIds[currentCardIndex] } })
        .then(({ data }) => {
          if (data && data.question) {
            setFlashCards((prev) => [...prev, data.question]);
          }
        })
        .catch((err) => console.error("Error fetching question:", err));
    }
  }, [questionIds, currentCardIndex, flashCards, getQuestion]);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    if (currentCardIndex < questionIds.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const renderCardBack = (card: FlashCard) => {
    if (card.correctAnswer.toLowerCase() === "all of the above") {
      return card.answers.filter(
        (answer) => answer.toLowerCase() !== "all of the above"
      );
    } else {
      return [card.correctAnswer];
    }
  };

  if (authLoading || idsLoading)
    return <p className="text-center text-xl mt-8">Loading...</p>;
  if (idsError)
    return (
      <p className="text-center text-xl mt-8 text-red-500">
        Error loading question IDs: {idsError.message}
      </p>
    );
  if (!user) return null; // This prevents any flash of content before redirect
  if (questionIds.length === 0)
    return (
      <p className="text-center text-xl mt-8">No flash cards available.</p>
    );

  const currentCard = flashCards[currentCardIndex];

  if (questionLoading || !currentCard)
    return <p className="text-center text-xl mt-8">Loading question...</p>;
  if (questionError)
    return (
      <p className="text-center text-xl mt-8 text-red-500">
        Error loading question: {questionError.message}
      </p>
    );

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <style jsx>{`
        .flip-card {
          perspective: 1000px;
        }
        .flip-card-inner {
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front,
        .flip-card-back {
          backface-visibility: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">
        Drone Pilot Flash Cards
      </h1>
      <p className="text-center mb-4">Welcome, {user.username}!</p>

      <div
        className={`flip-card w-full h-64 ${isFlipped ? "flipped" : ""}`}
        onClick={handleCardClick}
      >
        <div className="flip-card-inner relative w-full h-full">
          <div className="flip-card-front absolute w-full h-full bg-white border-2 border-gray-300 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center">
            <p className="text-2xl text-center">{currentCard.questionText}</p>
          </div>
          <div className="flip-card-back absolute w-full h-full bg-blue-100 border-2 border-blue-300 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center">
            {renderCardBack(currentCard).map((answer, index) => (
              <p key={index} className="text-xl text-center mb-2">
                {answer}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePreviousCard}
          disabled={currentCardIndex === 0}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Previous Card
        </button>
        <button
          onClick={handleNextCard}
          disabled={currentCardIndex === questionIds.length - 1}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Next Card
        </button>
      </div>

      <p className="text-center mt-4">
        Card {currentCardIndex + 1} of {questionIds.length}
      </p>
    </div>
  );
}
