"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { gql, useQuery, useMutation, ApolloError } from "@apollo/client";
import { useAuth } from "../../contexts/AuthContext";

import Sidebar from "./Sidebar";
import QuestionManagement from "./QuestionManagement";
import UserManagement from "./UserManagement";

// GraphQL queries and mutations
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
      points
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
      points
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
      points
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

const REGISTER_USER = gql`
  mutation RegisterUser($input: CreateUserInput!) {
    register(input: $input) {
      user {
        id
        username
        email
        role
      }
      token
    }
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

// Types
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

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

interface MainContentProps {
  activeTab: string;
  user: User;
  usersData?: { users: User[] };
  usersLoading: boolean;
  usersError?: ApolloError;
  questionsData?: { questions: Question[] };
  handleChangeUserRole: (userId: string, newRole: string) => void;
  handleDeleteUser: (userId: string) => void;
  handleCreateQuestion: (event: React.FormEvent<HTMLFormElement>) => void;
  handleUpdateQuestion: (id: string, updatedQuestion: Question) => void;
  handleDeleteQuestion: (id: string) => void;
  editingQuestion: Question | null;
  setEditingQuestion: (question: Question | null) => void;
  handleRegisterUser: (newUser: Omit<User, "id">) => void;
}

// Main content area
const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  user,
  usersData,
  usersLoading,
  usersError,
  ...props
}) => {
  switch (activeTab) {
    case "users":
      if (usersLoading) return <div>Loading users...</div>;
      if (usersError)
        return <div>Error loading users: {usersError.message}</div>;
      return <UserManagement user={user} usersData={usersData} {...props} />;
    case "questions":
      return <QuestionManagement user={user} {...props} />;
    default:
      return <div>Select a tab</div>;
  }
};

const ManagementPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("questions");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

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
  const [registerUser] = useMutation(REGISTER_USER);
  const [changeUserRole] = useMutation(CHANGE_USER_ROLE);
  const [deleteUser] = useMutation(DELETE_USER);

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
    const points = parseInt(
      (form.elements.namedItem("points") as HTMLInputElement).value,
      10
    );

    try {
      await createQuestion({
        variables: {
          input: {
            prompt,
            questionText,
            answers,
            correctAnswer,
            hint,
            points,
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
            points: editingQuestion.points,
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

  const handleRegisterUser = async (newUser: Omit<User, "id">) => {
    try {
      const { data } = await registerUser({
        variables: {
          input: {
            username: newUser.username,
            email: newUser.email,
            password: "defaultPassword", // You should handle this more securely
            role: newUser.role,
          },
        },
      });
      if (data?.register?.user) {
        alert("User registered successfully");
        refetchUsers();
      } else {
        alert("Failed to register user");
      }
    } catch (err) {
      if (err instanceof Error) {
        alert(`Error registering user: ${err.message}`);
        console.error("Detailed error:", err);
      } else {
        alert("An unknown error occurred");
        console.error("Unknown error:", err);
      }
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && ["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      if (activeTab === "users") {
        refetchUsers();
      }
    } else if (
      user &&
      !["SUPER_ADMIN", "ADMIN"].includes(user.role) &&
      activeTab === "users"
    ) {
      setActiveTab("questions");
    }
  }, [authLoading, user, router, activeTab, refetchUsers]);

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      await changeUserRole({
        variables: { userId, newRole },
      });
      if (userId === user?.id) {
        // If the current user's role was changed, we might need to handle this differently
        // For now, we'll just refetch the users
        refetchUsers();
      } else {
        await refetchUsers();
      }
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
  if (!user) return null;

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      <main className="ml-64 p-8 flex-grow">
        <MainContent
          activeTab={activeTab}
          user={user}
          usersData={usersData}
          usersLoading={usersLoading}
          usersError={usersError}
          questionsData={questionsData}
          handleChangeUserRole={handleChangeUserRole}
          handleDeleteUser={handleDeleteUser}
          handleCreateQuestion={handleCreateQuestion}
          handleUpdateQuestion={handleUpdateQuestion}
          handleDeleteQuestion={handleDeleteQuestion}
          editingQuestion={editingQuestion}
          setEditingQuestion={setEditingQuestion}
          handleRegisterUser={handleRegisterUser}
        />
      </main>
    </div>
  );
};

export default ManagementPage;
