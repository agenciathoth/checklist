import { Users } from "@prisma/client";

interface UsersListProps {
  users: Users[];
}

export function UsersList({ users }: UsersListProps) {
  return (
    <ul className="flex flex-col gap-6">
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
