"use client";

import Image from "next/image";
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
  ArrowsOutSimple,
  Play,
} from "@phosphor-icons/react";
import { TaskResponsible } from "@prisma/client";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CreateTaskSchema, createTaskSchema } from "@/validators/task";
import { TextArea } from "@/components/TextArea";
import { TaskEditItem, TaskListItem } from "@/services/tasks";
import { parseISO, subMinutes } from "date-fns";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { getMediaURL } from "@/lib/aws";
import { cn } from "@/utils/cn";
import { getPresignedURL } from "@/utils/presignedURL";

interface TaskFormProps {
  customerId: string;
  editingTaskId: string | null;
  onCloseEdit: () => void;
  onTaskCreated: () => void;
  onTaskUpdated: (taskId: string, data: Partial<TaskListItem>) => void;
}

type Media = CreateTaskSchema["medias"][0] & {
  file?: File;
};

export function TaskForm({
  customerId,
  editingTaskId,
  onCloseEdit,
  onTaskCreated,
  onTaskUpdated,
}: TaskFormProps) {
  const [selectedTask, setSelectedTask] = useState<TaskEditItem | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const isEditing = !!selectedTask;

  const [medias, setMedias] = useState<Media[]>([]);

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
        ? subMinutes(new Date(selectedTask.due), new Date().getTimezoneOffset())
            .toISOString()
            .slice(0, 16)
        : "",
      ratio: selectedTask?.ratio || "",
      responsible: selectedTask?.responsible || TaskResponsible.CUSTOMER,
      medias: medias.map((m) => ({
        ...(m.id ? { id: m.id } : {}),
        order: m.order,
        path: m.path,
        type: m.type,
        url: m.url,
        ...(m.isVideo !== undefined ? { isVideo: m.isVideo } : {}),
      })),
      customerId,
    },
    resolver: zodResolver(createTaskSchema),
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const prevEditingTaskIdRef = useRef(editingTaskId);

  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (prevEditingTaskIdRef.current && !editingTaskId) {
      setIsFormOpen(false);
      reset();
      setMedias([]);
    }

    prevEditingTaskIdRef.current = editingTaskId;
  }, [editingTaskId, reset]);

  useEffect(() => {
    if (!editingTaskId) {
      setSelectedTask(null);
      return;
    }

    setIsFormOpen(true);

    const fetchTask = async () => {
      setSelectedTask(null);
      setIsLoadingTask(true);

      try {
        const { data } = await api.get<TaskEditItem>(`tasks/${editingTaskId}`);
        setSelectedTask(data);
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível carregar a tarefa");
        onCloseEdit();
      } finally {
        setIsLoadingTask(false);
      }
    };

    fetchTask();
  }, [editingTaskId, onCloseEdit]);

  useEffect(() => {
    setMedias(
      selectedTask?.medias.map(({ id, order, path, type }) => ({
        id,
        path,
        type,
        url: getMediaURL(path),
        order,
        isVideo: type.startsWith("video"),
      })) || [],
    );
  }, [selectedTask?.medias]);

  const cancelEditTask = () => {
    onCloseEdit();
    reset();
    setSelectedTask(null);
    setIsFormOpen(false);
  };

  const closeForm = () => {
    reset();
    setMedias([]);
    setIsFormOpen(false);
  };

  const handleCreateTask = async (formData: CreateTaskSchema) => {
    try {
      const newMedias = medias.filter(({ file }) => Boolean(file));

      const urls = await Promise.all(
        newMedias.map(async (media) => {
          const data = await getPresignedURL({
            fileName: media.file?.name || "",
            fileType: media.file?.type.split("/")[0] || "",
            customerId,
          });

          return { ...media, ...data };
        }),
      );

      if (isEditing && selectedTask) {
        const deletedMedias = selectedTask.medias.filter(
          ({ id }) => !medias.map(({ id }) => id).includes(id),
        );
        await Promise.all(
          deletedMedias.map(({ id }) => api.delete(`media/${id}`)),
        );

        if (deletedMedias.length) {
          await api.put(`tasks/${selectedTask.id}/media/reorder`);
        }

        const updatedMedias = medias.filter(({ id, order }) => {
          const selectedMedia = selectedTask.medias.find(
            ({ id: mediaId }) => mediaId === id,
          );

          return selectedMedia && selectedMedia.order !== order;
        });
        await Promise.all(
          updatedMedias.map(({ id, order }) =>
            api.put(`media/${id}`, { order }),
          ),
        );

        await api.put(`tasks/${selectedTask.id}`, {
          ...formData,
          medias: urls,
        });
      } else {
        await api.post("tasks", { ...formData, medias: urls });
      }

      await Promise.all(
        urls.map(async ({ url, file, type }) => {
          await fetch(url, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": type,
            },
          });
        }),
      );

      toast.success(
        !isEditing
          ? "Tarefa criada com sucesso!"
          : "Tarefa editada com sucesso!",
      );

      if (isEditing && selectedTask) {
        onTaskUpdated(selectedTask.id, {
          title: formData.title,
          description: formData.description || null,
          due: parseISO(formData.due),
          ratio: formData.ratio || null,
          responsible: formData.responsible,
        });
        cancelEditTask();
      } else {
        await onTaskCreated();
        closeForm();
      }
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
      }),
    );
  };

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const { files: _files } = event.target;
    if (!_files) return;

    const files = Array.from(_files);
    const filteredFiles = files.filter(
      ({ type }) => type.startsWith("image") || type.startsWith("video"),
    );

    if (filteredFiles.length < files.length) {
      toast.info(
        "Você não pode enviar arquivos que não sejam de tipo imagem/vídeo",
      );
    }

    setMedias((prevState) => {
      const uploadedMedias: Media[] = filteredFiles.map((file, index) => ({
        file,
        path: "",
        type: file.type,
        url: URL.createObjectURL(file),
        order: prevState.length + index + 1,
        isVideo: file.type.startsWith("video"),
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
        })),
    );
  };

  return (
    <>
      {!isFormOpen ? (
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 text-primary border border-primary font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          <Plus size={16} weight="bold" />
          Adicionar post
        </button>
      ) : null}

      {isFormOpen || editingTaskId ? (
        <form
          className="flex flex-col gap-8 w-full p-5 bg-white rounded-xl drop-shadow-custom"
          onSubmit={handleSubmit(handleCreateTask)}
        >
          <h2 className="font-bold text-lg">
            {editingTaskId || isEditing
              ? "Edição de tarefa"
              : "Cadastro de tarefa"}
          </h2>

          <fieldset
            disabled={isLoadingTask}
            className={cn(
              "flex flex-col gap-4 border-0 p-0 m-0 min-w-0 transition-opacity",
              { "opacity-20 pointer-events-none": isLoadingTask },
            )}
          >
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
              icon={<ArrowsOutSimple />}
              placeholder="Proporção"
              options={[
                { label: "Post 1:1 - 1080 x 1080", value: "1:1" },
                { label: "Post 4:5 - 1080 x 1350", value: "4:5" },
                { label: "Post 3:4 - 1080 × 1440", value: "3:4" },
                { label: "Reels 9:16 - 1080 x 1920", value: "9:16" },
                { label: "Vídeo 16:9 - 1920 x 1080", value: "16:9" },
              ]}
              error={errors.ratio?.message}
              {...register("ratio")}
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
                {medias.map(({ id, url, isVideo }, index) => (
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

                      {isVideo ? (
                        <>
                          <i
                            className={cn(
                              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                              "text-white drop-shadow-xl z-10",
                            )}
                          >
                            <Play size={36} weight="fill" />
                          </i>

                          <video className="absolute inset-0 size-full object-cover">
                            <source src={url} />
                          </video>
                        </>
                      ) : (
                        <Image
                          className="absolute inset-0 size-full object-cover"
                          src={url}
                          alt=""
                          fill
                          draggable={false}
                        />
                      )}
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
                accept="image/*, video/*"
                onChange={onUpload}
                multiple
              />
            </div>
          </fieldset>

          <div className="flex justify-between gap-4">
            <button
              type="button"
              className="flex-1 sm:flex-initial sm:min-w-44 p-4 bg-shape-text text-text font-bold text-sm rounded-full uppercase disabled:opacity-50"
              onClick={isEditing ? cancelEditTask : closeForm}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoadingTask || isSubmitting}
              className="flex-1 sm:flex-initial sm:min-w-44 ml-auto p-4 bg-primary text-white font-bold text-sm rounded-full uppercase disabled:opacity-50"
            >
              {isLoadingTask
                ? "Carregando..."
                : !isSubmitting
                  ? !isEditing
                    ? "Adicionar"
                    : "Editar"
                  : !isEditing
                    ? "Adicionando..."
                    : "Editando..."}
            </button>
          </div>
        </form>
      ) : null}
    </>
  );
}
