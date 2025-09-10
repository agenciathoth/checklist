import { TitlePage } from "@/components/TitlePage";
import { TopNav } from "@/components/TopNav";
import { nextAuthOptions } from "@/config/auth";
import { getServerSession } from "next-auth";
import { CustomerPresentation } from "./CustomerPresentation";
import { BottomNav } from "./BottomNav";
import { TaskForm } from "./TaskForm";
import { Skeleton } from "@/components/Skeleton";

export default async function CustomerLoading() {
  const session = await getServerSession(nextAuthOptions);

  return (
    <>
      {session ? <TopNav /> : null}

      <TitlePage>Planner | Carregando...</TitlePage>

      <CustomerPresentation presentation={""} />
      {session ? <TaskForm customerId={""} tasks={[]} /> : null}
      <ul className="flex flex-col gap-6 p-6 bg-white rounded-xl drop-shadow-custom">
        {[...new Array(6)].map((_, index) => (
          <Skeleton key={index} className="w-full h-[150px]" />
        ))}
      </ul>

      <div className="h-16" />

      <BottomNav />
    </>
  );
}
