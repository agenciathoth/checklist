"use client";

import { useState } from "react";
import { ArrowLeft, Info, List, SignOut, X } from "@phosphor-icons/react";
import { signOut } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";

interface TopNavProps {
  shouldShowBackButton?: boolean;
  isAdmin?: boolean;
  showArchivedFlag?: boolean;
}

export function TopNav({
  isAdmin,
  showArchivedFlag,
  shouldShowBackButton = true,
}: TopNavProps) {
  const router = useRouter();

  const [isMenuOpened, setIsMenuOpened] = useState(false);

  const handleMenuClick = () => {
    if (!isAdmin) {
      router.push("/clientes");
      return;
    }

    setIsMenuOpened((prevState) => !prevState);
  };

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  return (
    <nav className="fixed top-4 left-1/2 flex items-center justify-center w-full max-w-[600px] -translate-x-1/2 z-20">
      <div className="absolute top-0 left-2 md:left-0">
        {shouldShowBackButton ? (
          <button
            type="button"
            className="flex items-center justify-center w-10 h-10 bg-white text-text rounded-full drop-shadow-xl"
            onClick={handleMenuClick}
          >
            {isAdmin ? (
              isMenuOpened ? (
                <X size={20} weight="bold" />
              ) : (
                <List size={20} weight="bold" />
              )
            ) : (
              <ArrowLeft size={20} weight="bold" />
            )}
          </button>
        ) : null}

        {isMenuOpened ? (
          <nav
            className="mt-4 p-4 px-6 bg-white text-text rounded-lg drop-shadow-xl"
            onClick={() => setIsMenuOpened(false)}
          >
            <ul className="flex flex-col gap-2 font-medium text-sm text-primary">
              <li>
                <Link href="/funcionarios">Funcionários</Link>
              </li>
              <li>
                <Link href="/clientes">Clientes</Link>
              </li>
            </ul>
          </nav>
        ) : null}
      </div>

      {showArchivedFlag ? (
        <span className="flex items-center justify-center gap-1 px-4 py-2 bg-tertiary text-white rounded-full drop-shadow-md">
          <Info size={16} weight="bold" />
          <strong className="font-semibold text-xs">Cliente arquivado</strong>
        </span>
      ) : null}

      <button
        type="button"
        className="absolute top-0 right-2 flex items-center justify-center gap-2 px-4 py-2 bg-white text-text rounded-full drop-shadow-xl md:right-0"
        onClick={handleLogout}
      >
        <SignOut size={18} weight="bold" />
        <strong className="font-semibold text-sm">Sair</strong>
      </button>
    </nav>
  );
}
