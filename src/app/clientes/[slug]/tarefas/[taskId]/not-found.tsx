import Link from "next/link";
import { TitlePage } from "@/components/TitlePage";

export default function TaskNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <TitlePage>Tarefa não encontrada</TitlePage>
      <p className="text-slate-600 text-sm">
        A tarefa que você está procurando não existe ou não está disponível.
      </p>
      <Link
        href="/clientes"
        className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
      >
        ← Voltar para clientes
      </Link>
    </div>
  );
}
