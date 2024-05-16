"use client";

import Image from "next/image";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import SortableList, { SortableItem } from "react-easy-sort";
import arrayMove from "array-move";

import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  ChatText,
  CheckCircle,
  User,
  Plus,
  X,
} from "@phosphor-icons/react";
import { TaskResponsible } from "@prisma/client";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CreateTaskSchema, createTaskSchema } from "@/validators/task";
import { TextArea } from "@/components/TextArea";
import { CustomerWithTasks } from "./page";
import { subMinutes } from "date-fns";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { getMediaURL } from "@/lib/aws";

interface TaskFormProps
  extends Pick<Exclude<CustomerWithTasks, null>, "tasks"> {
  customerId: string;
}

type Media = CreateTaskSchema["medias"][0];

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
      medias: [],
      customerId,
    },
    resolver: zodResolver(createTaskSchema),
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const [medias, setMedias] = useState<Media[]>([]);

  useEffect(() => {
    setMedias(
      selectedTask?.medias.map(({ id, path, order }) => ({
        id,
        url: getMediaURL(path),
        order,
      })) || []
    );
  }, [selectedTask?.medias]);

  const cancelEditTask = () => {
    router.replace(pathname);
    reset();
  };

  const handleCreateTask = async ({
    title,
    description,
    due,
    responsible,
    customerId,
  }: CreateTaskSchema) => {
    try {
      const newMedias = medias.filter(({ file }) => Boolean(file));

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description || "");
      formData.append("due", due);
      formData.append("responsible", responsible);
      newMedias.forEach((media) => {
        formData.append("medias", media.file);
        formData.append("mediasOrder", String(media.order));
      });
      formData.append("customerId", customerId);

      if (isEditing && selectedTask) {
        const deletedMedias = selectedTask.medias.filter(
          ({ id }) => !medias.map(({ id }) => id).includes(id)
        );
        await Promise.all(
          deletedMedias.map(({ id }) => api.delete(`media/${id}`))
        );

        const updatedMedias = medias.filter(({ id, order }) => {
          const selectedMedia = selectedTask.medias.find(
            ({ id: mediaId }) => mediaId === id
          );

          return selectedMedia && selectedMedia.order !== order;
        });
        await Promise.all(
          updatedMedias.map(({ id, order }) =>
            api.put(`media/${id}`, { order })
          )
        );

        await api.put(`tasks/${selectedTask.id}`, formData);
      } else {
        await api.post("tasks", formData);
      }

      toast.success(
        !isEditing
          ? "Tarefa criada com sucesso!"
          : "Tarefa editada com sucesso!"
      );
      cancelEditTask();
      window.location.reload();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data);
      }
    }
  };

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setMedias((medias) =>
      arrayMove([...medias], oldIndex, newIndex).map((media, index) => {
        return {
          ...media,
          order: index + 1,
        };
      })
    );
  };

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const { files: _files } = event.target;
    if (!_files) return;

    const files = Array.from(_files);
    const filteredFiles = files.filter(({ type }) => type.startsWith("image"));

    if (filteredFiles.length < files.length) {
      toast.info("Você não pode enviar arquivos que não sejam de tipo imagem");
    }

    setMedias((prevState) => {
      const uploadedMedias: Media[] = filteredFiles.map((file, index) => ({
        file,
        url: URL.createObjectURL(file),
        order: prevState.length + index + 1,
      }));

      return [...prevState, ...uploadedMedias];
    });
  };

  const onDeleteImage = (index: number) => {
    setMedias((prevState) =>
      prevState
        .filter((_, i) => i !== index)
        .map((media, index) => ({
          ...media,
          order: index + 1,
        }))
    );
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

        <div>
          <strong className="text-sm font-semibold">Mídias</strong>
          <SortableList
            onSortEnd={onSortEnd}
            className="flex flex-wrap gap-4 w-full mt-4 select-none"
          >
            {medias.map(({ id, url }, index) => (
              <SortableItem key={id}>
                <div
                  className="relative flex-shrink-0 aspect-square rounded-lg overflow-hidden cursor-grab select-none"
                  style={{ width: "calc(25% - 12px)" }}
                >
                  <button
                    type="button"
                    className="absolute top-0 right-0 p-1.5 bg-red-600 text-white rounded-bl-lg z-10"
                    onClick={() => onDeleteImage(index)}
                  >
                    <X size={16} weight="bold" />
                  </button>

                  <Image
                    className="absolute inset-0 size-full object-cover"
                    src={url}
                    alt=""
                    fill
                    draggable={false}
                  />
                </div>
              </SortableItem>
            ))}

            <li
              className="flex-shrink-0 flex aspect-square cursor-grab select-none rounded-lg overflow-hidden"
              style={{ width: "calc(25% - 12px)" }}
            >
              <button
                type="button"
                className="flex items-center justify-center w-full bg-transparent text-primary border-primary border-2 rounded-lg overflow-hidden"
                onClick={() => inputRef.current?.click()}
              >
                <Plus size={24} weight="bold" />
              </button>
            </li>
          </SortableList>

          <input
            className="hidden"
            type="file"
            ref={inputRef}
            accept="image/*"
            onChange={onUpload}
            multiple
          />
        </div>
      </div>

      <div className="flex justify-between gap-4">
        {isEditing ? (
          <button
            type="button"
            className="flex-1 sm:flex-initial sm:min-w-44 p-4 bg-shape-text text-text font-bold text-sm rounded-full uppercase disabled:opacity-50"
            onClick={cancelEditTask}
          >
            Cancelar
          </button>
        ) : null}

        <button
          type="submit"
          className="flex-1 sm:flex-initial sm:min-w-44 ml-auto p-4 bg-primary text-white font-bold text-sm rounded-full uppercase disabled:opacity-50"
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
