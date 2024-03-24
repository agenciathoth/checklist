"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, ChatText, CheckCircle, User } from "@phosphor-icons/react";
import { TaskResponsible } from "@prisma/client";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CreateTaskSchema, createTaskSchema } from "@/validators/task";
import { TextArea } from "@/components/TextArea";
import { CustomerWithTasks } from "./page";
import { useEffect } from "react";
import { subMinutes } from "date-fns";

interface TaskFormProps extends Pick<CustomerWithTasks, "tasks"> {
  customerId: string;
}

export function TaskForm({ customerId, tasks }: TaskFormProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const taskId = searchParams.get("id");

  const selectedTask = tasks.find(({ id }) => id === taskId);
  const isEditing = !!selectedTask;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTaskSchema>({
    values: {
      title: selectedTask?.title || "",
      description: selectedTask?.description || "",
      due: selectedTask
        ? subMinutes(selectedTask.due, new Date().getTimezoneOffset())
            .toISOString()
            .slice(0, 16)
        : "",
      responsible: selectedTask?.responsible || TaskResponsible.CUSTOMER,
      customerId,
    },
    resolver: zodResolver(createTaskSchema),
  });

  const cancelEditTask = () => {
    router.replace(pathname);
    reset();
  };

  const handleCreateTask = async (data: CreateTaskSchema) => {
    try {
      isEditing && selectedTask
        ? await api.put(`tasks/${selectedTask.id}`, data)
        : await api.post("tasks", data);

      toast.success(
        !isEditing
          ? "Tarefa criada com sucesso!"
          : "Tarefa editada com sucesso!"
      );
      cancelEditTask();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data);
      }
    }
  };

  return (
    <form
      className="flex flex-col gap-8 w-full p-5 bg-white rounded-xl drop-shadow-custom"
      onSubmit={handleSubmit(handleCreateTask)}
    >
      <h2 className="font-bold text-lg">
        {isEditing ? "Edição de tarefa" : "Cadastro de tarefa"}
      </h2>

      <div className="flex flex-col gap-4">
        <Input
          icon={<CheckCircle />}
          placeholder="Título"
          error={errors.title?.message}
          {...register("title")}
        />

        <TextArea
          icon={<ChatText />}
          placeholder="Descrição"
          error={errors.description?.message}
          {...register("description")}
        />

        <Input
          type="datetime-local"
          icon={<Calendar />}
          placeholder="Prazo"
          error={errors.due?.message}
          {...register("due")}
        />

        <Select
          icon={<User />}
          placeholder="Responsável"
          options={[
            { label: "Cliente", value: TaskResponsible.CUSTOMER },
            { label: "Thoth", value: TaskResponsible.AGENCY },
          ]}
          error={errors.responsible?.message}
          {...register("responsible")}
        />
      </div>

      <div className="flex justify-between">
        {isEditing ? (
          <button
            type="button"
            className="min-w-44 p-4 bg-shape-text text-text font-bold text-sm rounded-full uppercase disabled:opacity-50"
            onClick={cancelEditTask}
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
