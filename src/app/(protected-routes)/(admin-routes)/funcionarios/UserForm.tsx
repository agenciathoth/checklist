"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { api } from "@/lib/api";
import {
  CreateUserSchema,
  createUserSchema,
  editUserSchema,
} from "@/validators/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { At, Lock, User } from "@phosphor-icons/react";
import { UserRole, Users } from "@prisma/client";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface UserFormProps {
  users: Users[];
}

export function UserForm({ users }: UserFormProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const userId = searchParams.get("id");

  const selectedUser = users.find(({ id }) => id === userId);
  const isEditing = !!selectedUser;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserSchema>({
    values: {
      name: selectedUser?.name || "",
      email: selectedUser?.email || "",
      password: "",
      role: selectedUser?.role || UserRole.EDITOR,
    },
    resolver: zodResolver(isEditing ? editUserSchema : createUserSchema),
  });

  const cancelEditUser = () => {
    router.replace(pathname);
    reset();
  };

  const handleCreateUser = async (data: CreateUserSchema) => {
    try {
      isEditing && selectedUser
        ? await api.put(`users/${selectedUser.id}`, data)
        : await api.post("users", data);

      toast.success(
        !isEditing
          ? "Usuário criado com sucesso!"
          : "Usuário editado com sucesso!"
      );
      reset();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data);
      }
    }
  };

  return (
    <form
      className="flex flex-col gap-8 w-full p-5 bg-white rounded-xl drop-shadow-custom"
      onSubmit={handleSubmit(handleCreateUser)}
    >
      <h2 className="font-bold text-lg">
        {isEditing ? "Edição de funcionário" : "Cadastro de funcionário"}
      </h2>

      <div className="flex flex-col gap-4">
        <Input
          icon={<User />}
          placeholder="Nome"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          icon={<At />}
          type="email"
          placeholder="E-mail"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          icon={<Lock />}
          type="password"
          placeholder="Senha"
          error={errors.password?.message}
          {...register("password")}
        />

        <Select
          icon={<User />}
          placeholder="Função"
          error={errors.role?.message}
          options={[
            { label: "Administrador", value: UserRole.ADMIN },
            { label: "Editor", value: UserRole.EDITOR },
          ]}
          {...register("role")}
        />
      </div>

      <div className="flex justify-between">
        {isEditing ? (
          <button
            type="button"
            className="min-w-44 p-4 bg-shape-text text-text font-bold text-sm rounded-full uppercase disabled:opacity-50"
            onClick={cancelEditUser}
          >
            Cancelar
          </button>
        ) : null}

        <button
          type="submit"
          className="min-w-44 ml-auto p-4 bg-primary text-white font-bold text-sm rounded-full uppercase disabled:opacity-50"
        >
          {!isSubmitting
            ? !isEditing
              ? "Adicionar"
              : "Editar"
            : !isEditing
            ? "Adicionando..."
            : "Editando..."}
        </button>
      </div>
    </form>
  );
}
