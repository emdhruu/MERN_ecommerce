import { useState } from "react";
import Header from "@/features/adminPanel/common/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Search } from "lucide-react";
import StatusBadge from "@/features/adminPanel/common/StatusBadge";
import LoadingSkeleton from "@/features/adminPanel/common/LoadingSkeleton";
import EmptyState from "@/features/adminPanel/common/EmptyState";
import ConfirmDialog from "@/features/adminPanel/common/ConfirmDialog";
import { useGetAllUsersQuery, useDeleteUserMutation } from "@/features/adminPanel/users/usersApi";
import toast from "react-hot-toast";

const Users = () => {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetAllUsersQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const allUsers = data?.data || [];
  const users = search
    ? allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : allUsers;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId).unwrap();
      toast.success("User deleted.");
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete user.");
    }
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <Header heading="Users" subheading="View and manage registered users." />

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <span className="text-sm text-gray-500">{users.length} users</span>
        </div>

        {/* Table */}
        {isLoading ? (
          <Card className="p-6"><LoadingSkeleton rows={8} columns={5} /></Card>
        ) : !users.length ? (
          <Card className="p-6"><EmptyState title="No users found" description="No users match your search." /></Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold text-center">Role</TableHead>
                    <TableHead className="font-semibold text-center">Verified</TableHead>
                    <TableHead className="font-semibold">Joined</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={user.isVerified ? "active" : "inactive"} />
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(user._id)}
                          className="p-2 hover:bg-red-50"
                          disabled={user.role === "admin"}
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Delete Confirm */}
        <ConfirmDialog
          isOpen={!!deleteId}
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </div>
  );
};

export default Users;
