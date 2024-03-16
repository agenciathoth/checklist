import { cn } from "@/utils/cn";
import { ComponentProps } from "react";

interface PillProps extends ComponentProps<"span"> {
  variant?: "primary" | "secondary" | "tertiary";
}

export function Pill({ children, variant, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "w-fit flex items-center justify-center px-3 py-1 font-semibold text-xs rounded-full leading-none",
        "bg-border text-text",
        {
          "bg-primary text-white": variant === "primary",
          "bg-secondary text-text": variant === "secondary",
          "bg-tertiary text-white": variant === "tertiary",
        }
      )}
      {...props}
    >
      {children}
    </span>
  );
}
