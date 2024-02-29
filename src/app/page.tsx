"use client";

import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form action="">
        <input type="text" placeholder="secret" />
        <button
          type="submit"
          onClick={() =>
            signIn("credentials", {
              callbackUrl: "/clientes",
            })
          }
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
