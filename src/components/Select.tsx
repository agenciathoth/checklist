import { IconContext } from "@phosphor-icons/react";
import { ComponentProps, forwardRef } from "react";

interface SelectProps extends ComponentProps<"select"> {
  icon: JSX.Element;
  error?: string;
  placeholder?: string;
  options: Array<{
    label: string;
    value: string;
  }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Component({ icon, placeholder, options, error, ...props }, ref) {
    return (
      <div className="flex flex-col w-full">
        <div
          className={`flex items-start w-full bg-shape  font-semibold text-sm rounded-xl ${
            error ? "border border-red-400" : ""
          }`}
        >
          <IconContext.Provider
            value={{
              size: 18,
              weight: "bold",
            }}
          >
            <span className="flex-shrink-0 flex  pt-4 pl-4">{icon}</span>
          </IconContext.Provider>

          <select
            ref={ref}
            className="flex-1 w-full h-[52px] block p-4 bg-transparent text-text outline-none invalid:text-shape-text"
            {...props}
          >
            {placeholder ? (
              <option value="" disabled={true} hidden={true}>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error ? <span className="text-xs text-red-500">{error}</span> : null}
      </div>
    );
  }
);
