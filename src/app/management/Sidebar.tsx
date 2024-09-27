import React from "react";

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
};

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user }) => {
  const canManageUsers = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

  return (
    <div className="w-64 bg-gray-800 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
        <p className="mb-4">Welcome, {user.username}</p>
        <p className="mb-4">Role: {user.role}</p>
      </div>
      <nav>
        <ul>
          {canManageUsers && (
            <li>
              <button
                className={`w-full text-left p-4 hover:bg-gray-700 ${
                  activeTab === "users" ? "bg-gray-700" : ""
                }`}
                onClick={() => setActiveTab("users")}
              >
                User Management
              </button>
            </li>
          )}
          <li>
            <button
              className={`w-full text-left p-4 hover:bg-gray-700 ${
                activeTab === "questions" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActiveTab("questions")}
            >
              Question Management
            </button>
          </li>
          {/* Add more sidebar items here as needed */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;