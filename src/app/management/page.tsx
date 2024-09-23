"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gql, useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useAuth } from "../../contexts/AuthContext";

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

const GET_ALL_USERS = gql`
  query AllUsers {
    users {
      id
      username
      email
      role
    }
  }
`;

const GET_ALL_QUESTIONS = gql`
  query AllQuestions {
    questions {
      id
      prompt
      questionText
      answers
      correctAnswer
      hint
      createdBy {
        id
        username
      }
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
      hint
    }
  }
`;

const UPDATE_QUESTION = gql`
  mutation UpdateQuestion($questionId: ID!, $input: UpdateQuestionInput!) {
    updateQuestion(id: $questionId, input: $input) {
      id
      prompt
      questionText
      answers
      correctAnswer
      hint
      createdBy {
        id
        username
      }
    }
  }
`;

const DELETE_QUESTION = gql`
  mutation DeleteQuestion($questionId: ID!) {
    deleteQuestion(id: $questionId)
  }
`;

const CHANGE_USER_ROLE = gql`
  mutation ChangeUserRole($userId: ID!, $newRole: Role!) {
    changeUserRole(userId: $userId, newRole: $newRole) {
      id
      username
      email
      role
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;

export default function ManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isUserSectionCollapsed, setIsUserSectionCollapsed] = useState(false);
  const [isQuestionSectionCollapsed, setIsQuestionSectionCollapsed] =
    useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const {
    loading: usersLoading,
    error: usersError,
    data: usersData,
    refetch: refetchUsers,
  } = useQuery(GET_ALL_USERS, {
    skip: !user || !["SUPER_ADMIN", "ADMIN"].includes(user?.role || ""),
    fetchPolicy: "network-only",
  });

  const {
    loading: questionsLoading,
    error: questionsError,
    data: questionsData,
    refetch: refetchQuestions,
  } = useQuery(GET_ALL_QUESTIONS, {
    fetchPolicy: "network-only",
  });

  const [createQuestion] = useMutation(CREATE_QUESTION);
  const [updateQuestion] = useMutation(UPDATE_QUESTION);
  const [deleteQuestion] = useMutation(DELETE_QUESTION);
  const [changeUserRole] = useMutation(CHANGE_USER_ROLE);
  const [deleteUser] = useMutation(DELETE_USER);

  const handleLogout = async () => {
    logout();
    router.push("/login");
  };

  const handleCreateQuestion = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const prompt = (form.elements.namedItem("prompt") as HTMLInputElement)
      .value;
    const questionText = (
      form.elements.namedItem("questionText") as HTMLInputElement
    ).value;
    const answers = (
      form.elements.namedItem("answers") as HTMLInputElement
    ).value
      .split(",")
      .map((a) => a.trim());
    const correctAnswer = (
      form.elements.namedItem("correctAnswer") as HTMLInputElement
    ).value;
    const hint = (form.elements.namedItem("hint") as HTMLInputElement).value;

    try {
      await createQuestion({
        variables: {
          input: {
            prompt,
            questionText,
            answers,
            correctAnswer,
            hint,
          },
        },
      });
      alert("Question added successfully");
      form.reset();
      refetchQuestions();
    } catch (err) {
      alert("Error adding question");
      console.error(err);
    }
  };

  const handleUpdateQuestion = async (questionId: string) => {
    if (!editingQuestion) return;
    try {
      await updateQuestion({
        variables: {
          questionId,
          input: {
            prompt: editingQuestion.prompt,
            questionText: editingQuestion.questionText,
            answers: editingQuestion.answers,
            correctAnswer: editingQuestion.correctAnswer,
            hint: editingQuestion.hint,
          },
        },
      });
      setEditingQuestion(null);
      refetchQuestions();
    } catch (err) {
      console.error("Error updating question:", err);
      alert("Failed to update question");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const { data } = await deleteQuestion({
          variables: { questionId },
        });
        if (data.deleteQuestion) {
          refetchQuestions();
          alert("Question deleted successfully");
        } else {
          alert("Failed to delete question");
        }
      } catch (err) {
        console.error("Error deleting question:", err);
        alert("Error deleting question");
      }
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      await changeUserRole({
        variables: { userId, newRole },
      });
      await refetchUsers();
    } catch (err) {
      alert("Error changing user role");
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const { data } = await deleteUser({
          variables: { userId },
        });
        if (data.deleteUser) {
          await refetchUsers();
          alert("User deleted successfully");
        } else {
          alert("Failed to delete user");
        }
      } catch (err) {
        alert("Error deleting user");
        console.error(err);
      }
    }
  };

  if (authLoading) return <p>Loading...</p>;
  if (!user) return null; // The useEffect hook will handle the redirection

  const canManageUsers = ["SUPER_ADMIN", "ADMIN"].includes(user.role);
  const canManageQuestions = ["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(
    user.role
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Management Dashboard</h1>
      <p className="mb-4">
        Welcome, {user.username} ({user.role})
      </p>

      <button
        onClick={handleLogout}
        className="mb-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>

      {canManageUsers && (
        <section className="mb-8">
          <h2
            className="text-xl font-semibold mb-2 cursor-pointer flex items-center"
            onClick={() => setIsUserSectionCollapsed(!isUserSectionCollapsed)}
          >
            Manage Users
            <svg
              className={`ml-2 h-5 w-5 transform ${
                isUserSectionCollapsed ? "rotate-0" : "rotate-180"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </h2>
          {!isUserSectionCollapsed && (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Username</th>
                  <th className="border border-gray-300 p-2">Email</th>
                  <th className="border border-gray-300 p-2">Role</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.users.map((user: any) => (
                  <tr key={user.id}>
                    <td className="border border-gray-300 p-2">
                      {user.username}
                    </td>
                    <td className="border border-gray-300 p-2">{user.email}</td>
                    <td className="border border-gray-300 p-2">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleChangeUserRole(user.id, e.target.value)
                        }
                        className="w-full p-1"
                      >
                        <option value="USER">USER</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER_ADMIN" disabled>
                          SUPER_ADMIN
                        </option>
                      </select>
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {canManageQuestions && (
        <section className="mb-8">
          <h2
            className="text-xl font-semibold mb-2 cursor-pointer flex items-center"
            onClick={() =>
              setIsQuestionSectionCollapsed(!isQuestionSectionCollapsed)
            }
          >
            Question Management
            <svg
              className={`ml-2 h-5 w-5 transform ${
                isQuestionSectionCollapsed ? "rotate-0" : "rotate-180"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </h2>
          {!isQuestionSectionCollapsed && (
            <>
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
                  <button
                    type="submit"
                    className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Create Question
                  </button>
                </form>
              </div>

              <h3 className="text-lg font-semibold mb-2">Manage Questions</h3>
              {questionsLoading ? (
                <p>Loading questions...</p>
              ) : questionsError ? (
                <p>Error loading questions: {questionsError.message}</p>
              ) : (
                <table className="w-full border-collapse border border-gray-300 mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2">Prompt</th>
                      <th className="border border-gray-300 p-2">
                        Question Text
                      </th>
                      <th className="border border-gray-300 p-2">Answers</th>
                      <th className="border border-gray-300 p-2">
                        Correct Answer
                      </th>
                      <th className="border border-gray-300 p-2">Hint</th>
                      <th className="border border-gray-300 p-2">Created By</th>
                      <th className="border border-gray-300 p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionsData?.questions.map((question: any) => (
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
                          {question.createdBy.username}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {editingQuestion?.id === question.id ? (
                            <button
                              onClick={() => handleUpdateQuestion(question.id)}
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
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
