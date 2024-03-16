"use client";

import { Pill } from "@/components/Pill";
import { api } from "@/lib/api";
import { cn } from "@/utils/cn";
import {
  ArchiveBox,
  ClockClockwise,
  Pencil,
  Trash,
} from "@phosphor-icons/react";
import { UserRole, Users } from "@prisma/client";
import { toast } from "react-toastify";

interface UsersListProps {
  users: Users[];
}

export function UsersList({ users }: UsersListProps) {
  const toggleArchive = async (id: string, isArchived: boolean) => {
    if (!id) return;
    const isConfirmed = window.confirm(
      !isArchived
        ? "Você deseja arquivar o usuário?"
        : "Você deseja restaurar o usuário?"
    );
    if (!isConfirmed) return;

    const promise = async () => {
      try {
        const response = await api.patch("/users/archive", {
          id,
        });

        console.log(response);
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    toast.promise(promise, {
      pending: !isArchived ? "Arquivando..." : "Restaurando...",
      success: !isArchived
        ? "Usuário arquivado com sucesso!"
        : "Usuário restaurado com sucesso!",
      error: !isArchived
        ? "Não foi possível arquivar o usuário!"
        : "Não foi possível restaurar o usuário!",
    });
  };

  return (
    <ul className="flex flex-col gap-6">
      {users.map((user) => {
        const isAdmin = user.role === UserRole.ADMIN;
        const isArchived = !!user.archivedAt;

        return (
          <li
            key={user.id}
            className={cn(
              "flex flex-col gap-3 p-5 bg-white rounded-xl drop-shadow-custom",
              {
                "opacity-50": isArchived,
              }
            )}
          >
            <Pill variant={isAdmin ? "tertiary" : "secondary"}>
              {user.role}
            </Pill>

            <div className="flex items-center justify-start gap-4">
              <h4 className="text-md font-semibold"> {user.name}</h4>

              <div className="flex gap-2 ml-auto">
                {!isArchived ? (
                  <>
                    <button
                      type="button"
                      title="Editar"
                      className="flex p-2 bg-secondary text-white rounded-full"
                      onClick={() => alert("Editar")}
                    >
                      <Pencil size={16} weight="bold" />
                    </button>

                    <button
                      type="button"
                      title="Arquivar"
                      className="flex p-2 bg-shape-text text-text rounded-full"
                      onClick={() => toggleArchive(user.id, isArchived)}
                    >
                      <ArchiveBox size={16} weight="bold" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      title="Restaurar"
                      className="flex p-2 bg-shape-text text-text rounded-full"
                      onClick={() => toggleArchive(user.id, isArchived)}
                    >
                      <ClockClockwise size={16} weight="bold" />
                    </button>

                    <button
                      type="button"
                      title="Remover"
                      className="flex p-2 bg-tertiary text-white rounded-full"
                      onClick={() => alert("Remover")}
                    >
                      <Trash size={16} weight="bold" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
