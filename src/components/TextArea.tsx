import { IconContext } from "@phosphor-icons/react";
import { ComponentProps, forwardRef } from "react";

interface TextAreaProps extends ComponentProps<"textarea"> {
  icon: JSX.Element;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function Component({ icon, error, ...props }, ref) {
    return (
      <div className="flex flex-col w-full">
        <div
          className={`flex items-start w-full bg-shape text-shape-text font-semibold text-sm rounded-xl ${
            error ? "border border-red-400" : ""
          }`}
        >
          <IconContext.Provider
            value={{
              size: 18,
              weight: "bold",
            }}
          >
            <span className="flex-shrink-0 flex pt-4 pl-4">{icon}</span>
          </IconContext.Provider>

          <textarea
            ref={ref}
            className="flex-1 w-full min-h-[100px] block p-4 bg-transparent text-text outline-none placeholder:text-shape-text"
            {...props}
          />
        </div>
        {error ? <span className="text-xs text-red-500">{error}</span> : null}
      </div>
    );
  }
);
