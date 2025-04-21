import { RefObject, useEffect } from "react";

type UseClickOutsideType = {
  elementRef: RefObject<HTMLElement | null>;
  onClickOutside: () => void;
  isActive?: boolean;
};

export const useClickOutside = ({
  elementRef,
  onClickOutside,
  isActive,
}: UseClickOutsideType) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isToastifyClick = (event.target as HTMLElement)?.closest(
        ".Toastify"
      );
      if (
        !isToastifyClick &&
        elementRef.current &&
        !elementRef.current.contains(event.target as Node)
      ) {
        onClickOutside();
      }
    };

    if (isActive) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [elementRef, onClickOutside, isActive]);
};
