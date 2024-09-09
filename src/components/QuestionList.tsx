"use client";

import { useQuery, gql } from "@apollo/client";

const GET_QUESTIONS = gql`
  query GetQuestions {
    questions {
      id
      questionText
      answers
      correctAnswer
    }
  }
`;

interface Question {
  id: string;
  questionText: string;
  answers: string[];
  correctAnswer: string;
}

export default function QuestionList() {
  const { loading, error, data } = useQuery<{ questions: Question[] }>(
    GET_QUESTIONS
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data?.questions.map((question) => (
        <div key={question.id} className="mb-4">
          <h2 className="text-xl font-semibold">{question.questionText}</h2>
          <ul className="list-disc pl-5">
            {question.answers.map((answer, index) => (
              <li key={index}>{answer}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
