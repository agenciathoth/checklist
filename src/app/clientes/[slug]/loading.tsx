import { TitlePage } from "@/components/TitlePage";
import { TopNav } from "@/components/TopNav";
import { nextAuthOptions } from "@/config/auth";
import { getServerSession } from "next-auth";
import { CustomerPresentation } from "./CustomerPresentation";
import { Skeleton } from "@/components/Skeleton";

export default async function CustomerLoading() {
  const session = await getServerSession(nextAuthOptions);

  return (
    <>
      <TopNav />
      <TitlePage>Planner | Carregando...</TitlePage>

      <CustomerPresentation presentation={""} />
      {session ? <Skeleton className="w-full h-12 rounded-full" /> : null}
      <Skeleton className="w-full h-12 rounded-full" />
      <ul className="flex flex-col gap-6 p-6 bg-white rounded-xl drop-shadow-custom">
        {[...new Array(6)].map((_, index) => (
          <Skeleton key={index} className="w-full h-[150px]" />
        ))}
      </ul>

      <div className="h-16" />
    </>
  );
}
