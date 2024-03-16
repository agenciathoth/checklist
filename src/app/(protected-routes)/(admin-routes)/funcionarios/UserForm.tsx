"use client";

import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { api } from "@/lib/api";
import { CreateUserSchema, createUserSchema } from "@/validators/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { At, Lock, User } from "@phosphor-icons/react";
import { UserRole } from "@prisma/client";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
  });

  const handleCreateUser = async (data: CreateUserSchema) => {
    try {
      const response = await api.post("users", data);
      console.log(response);

      toast.success("Usuário criado com sucesso!");
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
      <h2 className="font-bold text-lg">Cadastro de funcionário</h2>

      <div className="flex flex-col gap-4">
        <Input
          icon={<User />}
          placeholder="Nome"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          icon={<At />}
          placeholder="E-mail"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          icon={<Lock />}
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
            { label: "Editor", value: UserRole.EMPLOYEE },
          ]}
          {...register("role")}
        />
      </div>

      <button
        type="submit"
        className="min-w-44 mx-auto p-4 bg-primary text-white font-bold text-sm rounded-full uppercase disabled:opacity-50"
      >
        Criar
      </button>
    </form>
  );
}
