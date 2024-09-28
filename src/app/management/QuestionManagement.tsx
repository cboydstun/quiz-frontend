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

type SortField = 'prompt' | 'questionText' | 'answers' | 'correctAnswer' | 'hint' | 'points' | 'createdBy';
type SortDirection = 'asc' | 'desc';

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
  const [sortField, setSortField] = useState<SortField>('prompt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedQuestions = useMemo(() => {
    const filtered = (questionsData?.questions || []).filter((question) => {
      const searchLower = searchQuery.toLowerCase();
      return Object.entries(question).some(([key, value]) => {
        if (key === 'createdBy') {
          return question.createdBy?.username?.toLowerCase().includes(searchLower);
        }
        if (key === 'answers') {
          return question.answers.some(answer => 
            answer.toLowerCase().includes(searchLower)
          );
        }
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  
    return filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
  
      if (sortField === 'answers') {
        aValue = a.answers.join(', ');
        bValue = b.answers.join(', ');
      } else if (sortField === 'createdBy') {
        aValue = a.createdBy?.username ?? '';
        bValue = b.createdBy?.username ?? '';
      }
  
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [questionsData, searchQuery, sortField, sortDirection]);

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Question Management</h2>
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
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
            <th 
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort('prompt')}
            >
              Prompt <SortIndicator field="prompt" />
            </th>
            <th 
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort('questionText')}
            >
              Question Text <SortIndicator field="questionText" />
            </th>
            <th 
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort('answers')}
            >
              Answers <SortIndicator field="answers" />
            </th>
            <th 
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort('correctAnswer')}
            >
              Correct Answer <SortIndicator field="correctAnswer" />
            </th>
            <th 
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort('hint')}
            >
              Hint <SortIndicator field="hint" />
            </th>
            <th 
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort('points')}
            >
              Points <SortIndicator field="points" />
            </th>
            <th 
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort('createdBy')}
            >
              Created By <SortIndicator field="createdBy" />
            </th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
  {filteredAndSortedQuestions.map((question) => (
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
      {/* Similar structure for questionText, answers, correctAnswer, hint, points */}
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
            value={editingQuestion.answers.join(', ')}
            onChange={(e) =>
              setEditingQuestion({
                ...editingQuestion,
                answers: e.target.value.split(', '),
              })
            }
            className="w-full p-1 border rounded"
          />
        ) : (
          question.answers.join(', ')
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
            value={editingQuestion.hint}
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
