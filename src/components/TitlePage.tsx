import { ReactNode } from "react";

interface TitlePageProps {
  children: ReactNode;
}

export function TitlePage({ children }: TitlePageProps) {
  return (
    <h1 className="flex items-center justify-center bg-white text-text font-bold uppercase w-fit mx-auto px-6 py-3 rounded-full text-md drop-shadow-custom">
      {children}
    </h1>
  );
}
