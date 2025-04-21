import { api } from "@/lib/api";
import { Comment as CommentType } from "@/utils/api";
import { cn } from "@/utils/cn";
import { formatShortTimeDistance } from "@/utils/date";
import {
  Heart,
  Pencil,
  Repeat,
  Trash,
  TrashSimple,
} from "@phosphor-icons/react";
import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import {
  PropsWithChildren,
  ComponentProps,
  ButtonHTMLAttributes,
  useState,
} from "react";
import { toast } from "react-toastify";

const ActionButton = ({
  children,
  disabled,
  className,
  ...props
}: ComponentProps<"button">) => {
  return (
    <button
      className={cn(
        "flex gap-2 font-bold text-[#9A9FA5] text-sm leading-4 tracking-[-0.01em]",
        { "opacity-70 cursor-not-allowed": disabled },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

type CommentItemProps = Omit<CommentProps, "replies">;

const CommentItem = ({
  id,
  author,
  createdBy,
  text,
  updatedAt,
  isLiked: _isLiked,
  onReplyClick,
  onEditClick,
  onDeleteClick,
  parentId,
}: CommentItemProps) => {
  const session = useSession();
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(_isLiked);
  const isReply = !!parentId;

  const canLike =
    (session.data?.user && !!author) || session.data?.user.id !== createdBy?.id;

  const canManipulate =
    session.data?.user.role === UserRole.ADMIN ||
    createdBy?.id === session.data?.user.id;

  const onLikeComment = async () => {
    if (!canLike) {
      toast.info("Não é possível curtir seu próprio comentário");
      return;
    }

    try {
      if (isLiking) {
        return;
      }

      setIsLiking(true);
      await api.patch(`/comments/${id}/like`);

      toast.success(
        isLiked
          ? "Curtida removida com sucesso!"
          : "Curtida enviada com sucesso!"
      );

      setIsLiked((prevState) => !prevState);
    } catch (err) {
      toast.error("Não é foi possível curtir o comentário");
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-1 ", {
        "pb-6 border-b border-[#EFEFEF]": !isReply,
      })}
    >
      <div className="flex items-start justify-between">
        <h6 className="font-semibold text-md tracking-[-0.01em] text-[#1A1D1F]">
          {author || createdBy?.name}
        </h6>
        <span className="font-medium text-xs leading-[1] tracking-[-0.01em] text-[#9A9FA5]">
          {formatShortTimeDistance(new Date(updatedAt || ""))}
        </span>
      </div>
      <p className="block py-2 pr-2 font-medium text-[#33383F] text-md leading-6 tracking-[-0.015em]">
        {text}
      </p>

      <div className="flex items-center justify-start gap-6">
        <ActionButton disabled={!canLike} onClick={onLikeComment}>
          <Heart
            size={20}
            weight={isLiked ? "fill" : "bold"}
            className={isLiked ? "text-red-500" : undefined}
          />
          {isLiked ? "Curtido" : "Curtir"}
        </ActionButton>

        <ActionButton onClick={() => onReplyClick(parentId || id)}>
          <Repeat size={20} weight="bold" />
          Responder
        </ActionButton>

        {canManipulate ? (
          <>
            <ActionButton
              onClick={() => onEditClick(id)}
              className="text-secondary ml-auto"
            >
              <Pencil size={16} weight="bold" />
              Editar
            </ActionButton>
            <ActionButton
              onClick={() => onDeleteClick(id)}
              className="text-tertiary"
            >
              <TrashSimple size={16} weight="bold" />
              Remover
            </ActionButton>
          </>
        ) : null}
      </div>
    </div>
  );
};

type CommentProps = CommentType & {
  parentId?: string;
  onReplyClick: (id: string) => any;
  onEditClick: (id: string) => any;
  onDeleteClick: (id: string) => any;
};

export const Comment = (comment: CommentProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        "[&:not(:first-child)]:pt-6 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-[#EFEFEF]"
      )}
    >
      <CommentItem {...comment} />

      {comment.replies.length > 0 ? (
        <div className="flex flex-col gap-6 my-6 pl-16">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              parentId={comment.id}
              onReplyClick={comment.onReplyClick}
              onEditClick={comment.onEditClick}
              onDeleteClick={comment.onDeleteClick}
              {...reply}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
