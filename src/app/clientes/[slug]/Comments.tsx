import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/utils/cn";
import { X } from "@phosphor-icons/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Comment } from "./comment";
import { api } from "@/lib/api";
import { Comment as CommentType } from "@/utils/api";
import { useSession } from "next-auth/react";
import { createCommentSchema, CreateCommentSchema } from "@/validators/comment";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import sanitize from "sanitize-html";

type CommentsType = {
  taskId: string;
  isOpened: boolean;
  onClose: () => any;
};

const USERNAME_KEY = "ChecklistThoth@User";

export const Comments = ({ taskId, isOpened, onClose }: CommentsType) => {
  const session = useSession();

  const ref = useRef<HTMLDivElement>(null);

  const [isFetching, setIsFetching] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [parentId, setParentId] = useState("");

  const [selectedCommentId, setSelectedCommentId] = useState("");

  const commentItem = comments.find(
    ({ id, replies }) =>
      id === selectedCommentId ||
      replies.map(({ id }) => id).includes(selectedCommentId)
  );
  const selectedComment =
    commentItem?.id === selectedCommentId
      ? commentItem
      : commentItem?.replies.find(({ id }) => id === selectedCommentId);

  const isEditing = !!selectedComment?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCommentSchema>({
    values: {
      text: selectedComment?.text || "",
      author:
        selectedComment?.author ||
        session.data?.user.name ||
        (typeof window !== "undefined"
          ? localStorage.getItem(USERNAME_KEY) || ""
          : ""),
    },
    resolver: zodResolver(createCommentSchema),
  });

  useEffect(() => {
    document.body.style.overflow = isOpened ? "hidden" : "initial";
  }, [isOpened]);

  const fetchComments = async () => {
    try {
      if (!taskId) {
        return;
      }

      setIsFetching(true);
      setComments([]);

      const { data: comments } = await api.get<CommentType[]>(
        `tasks/${taskId}/comments`
      );

      setComments(comments);
    } catch (err) {
      toast.error("Não foi possível carregar os comentários");
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  useClickOutside({
    elementRef: ref,
    isActive: isOpened,
    onClickOutside: onClose,
  });

  const onReplyClick = (parentId: string) => {
    setParentId(parentId);

    ref.current?.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const sendComment = async (data: CreateCommentSchema) => {
    try {
      const body: CreateCommentSchema = {
        text: sanitize(data.text),
        author: !session.data?.user ? data.author : undefined,
        userId: session.data?.user.id || undefined,
        parentId: parentId || undefined,
      };

      if (isEditing) {
        await api.put(`/comments/${selectedCommentId}`, body);
      } else {
        await api.post(`/tasks/${taskId}/comments`, body);
      }

      if (typeof window !== "undefined" && body.author) {
        localStorage.setItem(USERNAME_KEY, body.author);
      }

      await fetchComments();
      reset();
      setParentId("");
      setSelectedCommentId("");

      toast.success(
        !isEditing
          ? "Comentário enviado com sucesso!"
          : "Comentário editado com sucesso!"
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (commentId: string) => {
    const isConfirmed = window.confirm("Você deseja remover o comentário?");
    if (!isConfirmed) return;

    const promise = async () => {
      try {
        await api.delete(`/comments/${commentId}`);

        setComments((prevState) => {
          const filteredComments = [...prevState].filter(
            ({ id }) => id !== commentId
          );

          return filteredComments.map(({ replies, ...comment }) => {
            const filteredReplies = [...replies].filter(
              ({ id }) => id !== commentId
            );

            return {
              ...comment,
              replies: filteredReplies,
            };
          });
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    toast.promise(promise, {
      pending: "Removendo...",
      success: "Comentário removido com sucesso!",
      error: "Não foi possível remover o comentário!",
    });
  };

  return (
    <div
      ref={ref}
      className={cn(
        "fixed left-0 right-0 bottom-0 p-6 bg-white rounded-t-2xl",
        "max-h-screen",
        "z-50 overflow-auto shadow-[1px_-17px_13px_0px_rgba(0,_0,_0,_0.05)]",
        "transition-all",
        "md:right-auto md:left-[50%] md:translate-x-[-50%] md:w-[568px] md:max-h-calc-vh",
        {
          "translate-y-[100%]": !isOpened,
        }
      )}
    >
      <div className="flex items-center justify-between py-2">
        <h4 className="font-semibold text-xl leading-8 tracking-[-0.02em]">
          Comentários
        </h4>
        <button
          className="flex items-center justify-center w-9 h-9"
          onClick={onClose}
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      <form
        className="flex flex-col gap-4 mt-6"
        onSubmit={handleSubmit(sendComment)}
      >
        {parentId ? (
          <button
            className="flex items-center gap-1 font-semibold text-[#9A9FA5] text-sm"
            type="button"
            onClick={() => setParentId("")}
          >
            <X size={16} weight="bold" />
            Respondendo comentário
          </button>
        ) : null}

        {selectedComment ? (
          <button
            className="flex items-center gap-1 font-semibold text-[#9A9FA5] text-sm"
            type="button"
            onClick={() => setSelectedCommentId("")}
          >
            <X size={16} weight="bold" />
            Editando comentário
          </button>
        ) : null}

        <Input
          placeholder="Seu Nome"
          disabled={session.status === "authenticated" || !!selectedCommentId}
          error={errors.author?.message}
          {...register("author")}
        />
        <TextArea
          placeholder="Digite o comentário"
          className="h-40"
          error={errors.text?.message}
          {...register("text")}
        />
        <button
          type="submit"
          className="flex w-fit py-2 px-4 ml-auto bg-secondary text-text font-bold text-sm leading-6 tracking-[-0.01em] rounded-lg text-center disabled:opacity-70 disabled:cursor-all-scroll"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar"}
        </button>
      </form>

      <div className="flex flex-col mt-6">
        {!isFetching && comments.length > 0 ? (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              onReplyClick={onReplyClick}
              onEditClick={(id) => {
                setSelectedCommentId(id);
              }}
              onDeleteClick={deleteComment}
              {...comment}
            />
          ))
        ) : (
          <div className="flex flex-col gap-1 pb-9 text-center">
            {isFetching ? (
              <h5 className="font-semibold text-md text-[#1A1D1F] tracking-[-0.01em]">
                Carregando...
              </h5>
            ) : (
              <>
                <h5 className="font-semibold text-md text-[#1A1D1F] tracking-[-0.01em]">
                  Nenhum comentário ainda.
                </h5>
                <p className="font-medium text-sm text-[#6F767E] tracking-[-0.01em]">
                  Seja o primeiro a comentar
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
