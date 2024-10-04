import React, { useState, useMemo } from "react";

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

type SortField =
  | "prompt"
  | "questionText"
  | "answers"
  | "correctAnswer"
  | "hint"
  | "points"
  | "createdBy";
type SortDirection = "asc" | "desc";

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
}) => {
  const [sortField, setSortField] = useState<SortField>("prompt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedQuestions = useMemo(() => {
    const filtered = (questionsData?.questions || []).filter((question) => {
      const searchLower = searchQuery.toLowerCase();
      return Object.entries(question).some(([key, value]) => {
        if (key === "createdBy") {
          return question.createdBy?.username
            ?.toLowerCase()
            .includes(searchLower);
        }
        if (key === "answers") {
          return question.answers.some((answer) =>
            answer.toLowerCase().includes(searchLower)
          );
        }
        return String(value).toLowerCase().includes(searchLower);
      });
    });

    return filtered.sort((a, b) => {
      let aValue: string | number = a[sortField] as string | number;
      let bValue: string | number = b[sortField] as string | number;

      if (sortField === "answers") {
        aValue = a.answers.join(", ");
        bValue = b.answers.join(", ");
      } else if (sortField === "createdBy") {
        aValue = a.createdBy?.username ?? "";
        bValue = b.createdBy?.username ?? "";
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [questionsData, searchQuery, sortField, sortDirection]);

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    return <span className="ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>;
  };

  // Type guard function
  const isQuestionKey = (key: string): key is keyof Question => {
    return [
      "prompt",
      "questionText",
      "answers",
      "correctAnswer",
      "hint",
      "points",
    ].includes(key);
  };

  // Helper function to render cell content
  const renderCellContent = (
    question: Question,
    field: string
  ): React.ReactNode => {
    if (editingQuestion?.id === question.id) {
      if (isQuestionKey(field)) {
        return (
          <input
            type={field === "points" ? "number" : "text"}
            value={
              field === "answers"
                ? editingQuestion[field].join(", ")
                : String(editingQuestion[field])
            }
            onChange={(e) =>
              setEditingQuestion({
                ...editingQuestion,
                [field]:
                  field === "answers"
                    ? e.target.value.split(", ")
                    : field === "points"
                    ? parseInt(e.target.value)
                    : e.target.value,
              })
            }
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
        );
      }
    } else if (isQuestionKey(field)) {
      return field === "answers"
        ? question[field].join(", ")
        : String(question[field]);
    }
    return "";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-3xl font-bold mb-6 text-blue-600">
        Question Management
      </h2>

      {/* Search input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
        />
      </div>

      {/* Add New Question Form */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">
          Add New Question
        </h3>
        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <input
            type="text"
            name="prompt"
            placeholder="Prompt"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
          <input
            type="text"
            name="questionText"
            placeholder="Question Text"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
          <input
            type="text"
            name="answers"
            placeholder="Answers (comma-separated)"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
          <input
            type="text"
            name="correctAnswer"
            placeholder="Correct Answer"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
          <input
            type="text"
            name="hint"
            placeholder="Hint (optional)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
          <input
            type="number"
            name="points"
            placeholder="Points"
            required
            min="1"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
          <button
            type="submit"
            className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
          >
            Create Question
          </button>
        </form>
      </div>

      {/* Manage Questions Table */}
      <h3 className="text-xl font-semibold mb-4 text-blue-600">
        Manage Questions
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 mb-4">
          <thead>
            <tr className="bg-gray-100">
              {[
                "Prompt",
                "Question Text",
                "Answers",
                "Correct Answer",
                "Hint",
                "Points",
                "Created By",
                "Actions",
              ].map((header, index) => (
                <th
                  key={index}
                  className="border border-gray-300 p-3 text-left cursor-pointer hover:bg-gray-200 transition duration-200"
                  onClick={() =>
                    handleSort(
                      header.toLowerCase().replace(" ", "") as SortField
                    )
                  }
                >
                  {header}{" "}
                  <SortIndicator
                    field={header.toLowerCase().replace(" ", "") as SortField}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedQuestions.map((question) => (
              <tr
                key={question.id}
                className="hover:bg-gray-50 transition duration-200"
              >
                {[
                  "prompt",
                  "questionText",
                  "answers",
                  "correctAnswer",
                  "hint",
                  "points",
                ].map((field) => (
                  <td key={field} className="border border-gray-300 p-3">
                    {renderCellContent(question, field)}
                  </td>
                ))}
                <td className="border border-gray-300 p-3">
                  {question.createdBy.username}
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  {editingQuestion?.id === question.id ? (
                    <button
                      onClick={() =>
                        handleUpdateQuestion(question.id, editingQuestion)
                      }
                      className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-200 mr-2"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingQuestion(question)}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200 mr-2"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionManagement;
