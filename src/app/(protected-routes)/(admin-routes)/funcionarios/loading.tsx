import { TitlePage } from "@/components/TitlePage";
import { UserForm } from "./UserForm";
import { Skeleton } from "@/components/Skeleton";

export default function EmployeesLoading() {
  return (
    <>
      <TitlePage>Funcionários</TitlePage>
      <UserForm users={[]} />
      <ul className="flex flex-col gap-6">
        {[...new Array(6)].map((_, index) => (
          <Skeleton key={index} className="w-full h-[104px]" />
        ))}
      </ul>
    </>
  );
}
