import React from "react";

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
};

type Question = {
  id: string;
  prompt: string;
  questionText: string;
  answers: string[];
  correctAnswer: string;
  hint?: string;
  points: number;
  createdBy: {
    id: string;
    username: string;
  };
};

interface QuestionManagementProps {
  user: User;
  questionsData?: { questions: Question[] };
  handleCreateQuestion: (event: React.FormEvent<HTMLFormElement>) => void;
  handleUpdateQuestion: (id: string, updatedQuestion: Question) => void;
  handleDeleteQuestion: (id: string) => void;
  editingQuestion: Question | null;
  setEditingQuestion: (question: Question | null) => void;
}

const QuestionManagement: React.FC<QuestionManagementProps> = ({
  questionsData,
  handleCreateQuestion,
  handleUpdateQuestion,
  handleDeleteQuestion,
  editingQuestion,
  setEditingQuestion,
  user,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Question Management</h2>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Add New Question</h3>
        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <input
            type="text"
            name="prompt"
            placeholder="Prompt"
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="questionText"
            placeholder="Question Text"
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="answers"
            placeholder="Answers (comma-separated)"
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="correctAnswer"
            placeholder="Correct Answer"
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="hint"
            placeholder="Hint (optional)"
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            name="points"
            placeholder="Points"
            required
            min="1"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Question
          </button>
        </form>
      </div>

      <h3 className="text-lg font-semibold mb-2">Manage Questions</h3>
      <table className="w-full border-collapse border border-gray-300 mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Prompt</th>
            <th className="border border-gray-300 p-2">Question Text</th>
            <th className="border border-gray-300 p-2">Answers</th>
            <th className="border border-gray-300 p-2">Correct Answer</th>
            <th className="border border-gray-300 p-2">Hint</th>
            <th className="border border-gray-300 p-2">Points</th>
            <th className="border border-gray-300 p-2">Created By</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questionsData?.questions.map((question) => (
            <tr key={question.id}>
              <td className="border border-gray-300 p-2">
                {editingQuestion?.id === question.id ? (
                  <input
                    type="text"
                    value={editingQuestion.prompt}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        prompt: e.target.value,
                      })
                    }
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  question.prompt
                )}
              </td>
              <td className="border border-gray-300 p-2">
                {editingQuestion?.id === question.id ? (
                  <input
                    type="text"
                    value={editingQuestion.questionText}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        questionText: e.target.value,
                      })
                    }
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  question.questionText
                )}
              </td>
              <td className="border border-gray-300 p-2">
                {editingQuestion?.id === question.id ? (
                  <input
                    type="text"
                    value={editingQuestion.answers.join(", ")}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        answers: e.target.value.split(", "),
                      })
                    }
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  question.answers.join(", ")
                )}
              </td>
              <td className="border border-gray-300 p-2">
                {editingQuestion?.id === question.id ? (
                  <input
                    type="text"
                    value={editingQuestion.correctAnswer}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correctAnswer: e.target.value,
                      })
                    }
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  question.correctAnswer
                )}
              </td>
              <td className="border border-gray-300 p-2">
                {editingQuestion?.id === question.id ? (
                  <input
                    type="text"
                    value={editingQuestion.hint || ""}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        hint: e.target.value,
                      })
                    }
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  question.hint
                )}
              </td>
              <td className="border border-gray-300 p-2">
                {editingQuestion?.id === question.id ? (
                  <input
                    type="number"
                    value={editingQuestion.points}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        points: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-1 border rounded"
                    min="1"
                  />
                ) : (
                  question.points
                )}
              </td>
              <td className="border border-gray-300 p-2">
                {question.createdBy.username}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {editingQuestion?.id === question.id ? (
                  <button
                    onClick={() =>
                      handleUpdateQuestion(question.id, editingQuestion)
                    }
                    className="bg-green-500 text-white p-1 rounded hover:bg-green-600 mr-2"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingQuestion(question)}
                    className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 mr-2"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionManagement;
