"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { SyntheticEvent, useState } from "react";
import { Lock, At } from "@phosphor-icons/react";
import { Input } from "@/components/Input";
import { TitlePage } from "@/components/TitlePage";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      alert("Credenciais inválidas");
      console.log(result);
      return;
    }

    router.replace("/clientes");
  };

  return (
    <main className="flex-1 relative flex flex-col gap-8 px-4 -mt-5">
      <TitlePage>Autenticação</TitlePage>

      <form
        className="flex flex-col gap-8 w-full p-5 bg-white rounded-xl drop-shadow-custom"
        onSubmit={handleSubmit}
      >
        <h2 className="font-bold text-lg">Fazer login</h2>

        <div className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            icon={<At />}
            placeholder="E-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            id="password"
            type="password"
            icon={<Lock />}
            placeholder="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button
          type="submit"
          className="min-w-44 mx-auto p-4 bg-primary text-white font-bold text-sm rounded-full uppercase disabled:opacity-50"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
