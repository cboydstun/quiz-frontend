import React, { useState } from "react";

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
};

type SortField = 'username' | 'email' | 'role';
type SortDirection = 'asc' | 'desc';

interface UserManagementProps {
  usersData?: { users: User[] };
  handleChangeUserRole: (userId: string, newRole: string) => void;
  handleDeleteUser: (userId: string) => void;
  handleRegisterUser: (newUser: Omit<User, "id">) => void;
  user: User;
}

const UserManagement: React.FC<UserManagementProps> = ({
  usersData,
  handleChangeUserRole,
  handleDeleteUser,
  handleRegisterUser,
  user,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, "id">>({
    username: "",
    email: "",
    role: "USER",
  });
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>('username');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegisterUser(newUser);
    closeModal();
    setNewUser({ username: "", email: "", role: "USER" });
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = usersData?.users
    .filter((u) => 
      (user.role === "SUPER_ADMIN" || u.role !== "SUPER_ADMIN") &&
      (roleFilter === "ALL" || u.role === roleFilter)
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }) || [];

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
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={openModal}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Create New User
        </button>
        <div>
          <label htmlFor="roleFilter" className="mr-2">Filter by Role:</label>
          <select
            id="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">USER</option>
            <option value="EDITOR">EDITOR</option>
            <option value="ADMIN">ADMIN</option>
            {user.role === "SUPER_ADMIN" && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
          </select>
        </div>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th 
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort('username')}
            >
              Username <SortIndicator field="username" />
            </th>
            <th 
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort('email')}
            >
              Email <SortIndicator field="email" />
            </th>
            <th 
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort('role')}
            >
              Role <SortIndicator field="role" />
            </th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedUsers.map((u) => (
            <tr key={u.id}>
              <td className="border border-gray-300 p-2">{u.username}</td>
              <td className="border border-gray-300 p-2">{u.email}</td>
              <td className="border border-gray-300 p-2">
                <select
                  value={u.role}
                  onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                  className="w-full p-1"
                  disabled={u.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN"}
                >
                  <option value="USER">USER</option>
                  <option value="EDITOR">EDITOR</option>
                  <option value="ADMIN">ADMIN</option>
                  {user.role === "SUPER_ADMIN" && (
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  )}
                </select>
              </td>
              <td className="border border-gray-300 p-2 text-center">
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  disabled={u.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN"}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Create New User</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="role"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="USER">USER</option>
                  <option value="EDITOR">EDITOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
