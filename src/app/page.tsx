"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock, At } from "@phosphor-icons/react";
import { Input } from "@/components/Input";
import { TitlePage } from "@/components/TitlePage";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

const authSchema = z.object({
  email: z
    .string()
    .email("Informe um e-mail válido")
    .min(1, "O campo é obrigatório"),
  password: z.string().min(1, "O campo é obrigatório"),
});

type AuthSchema = z.infer<typeof authSchema>;

export default function Home() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthSchema>({
    resolver: zodResolver(authSchema),
  });

  const handleAuth = async ({ email, password }: AuthSchema) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Credenciais inválidas");
      console.error(result);
      return;
    }

    router.replace("/funcionarios");
  };

  return (
    <>
      <TitlePage>Autenticação</TitlePage>

      <form
        className="flex flex-col gap-8 w-full p-5 bg-white rounded-xl drop-shadow-custom"
        onSubmit={handleSubmit(handleAuth)}
      >
        <h2 className="font-bold text-lg">Fazer login</h2>

        <div className="flex flex-col gap-4">
          <Input
            type="email"
            icon={<At />}
            placeholder="E-mail"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            type="password"
            icon={<Lock />}
            placeholder="Senha"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <button
          type="submit"
          className="min-w-44 mx-auto p-4 bg-primary text-white font-bold text-sm rounded-full uppercase disabled:opacity-50"
        >
          {!isSubmitting ? "Entrar" : "Entrando..."}
        </button>
      </form>
    </>
  );
}
