import { IconContext } from "@phosphor-icons/react";
import { parseISO, subMinutes } from "date-fns";
import { ComponentProps, forwardRef } from "react";

interface InputProps extends ComponentProps<"input"> {
  icon: JSX.Element;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Component({ icon, type = "text", error, ...props }, ref) {
    return (
      <div className="flex flex-col w-full">
        <div
          className={`flex items-center w-full bg-shape text-shape-text font-semibold text-sm rounded-xl ${
            error ? "border border-red-400" : ""
          }`}
        >
          <IconContext.Provider
            value={{
              size: 18,
              weight: "bold",
            }}
          >
            <span className="flex-shrink-0 flex pl-4">{icon}</span>
          </IconContext.Provider>

          <input
            ref={ref}
            type={type}
            className="flex-1  w-full block p-4 bg-transparent text-text outline-none placeholder:text-shape-text"
            {...props}
          />
        </div>
        {error ? <span className="text-xs text-red-500">{error}</span> : null}
      </div>
    );
  }
);
