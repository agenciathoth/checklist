import { TitlePage } from "@/components/TitlePage";
import { CustomerForm } from "./CustomerForm";
import { Skeleton } from "@/components/Skeleton";

export default function CustomersLoading() {
  return (
    <>
      <TitlePage>Clientes</TitlePage>
      <CustomerForm customers={[]} />
      <ul className="flex flex-col gap-6">
        {[...new Array(6)].map((_, index) => (
          <Skeleton key={index} className="w-full h-[104px]" />
        ))}
      </ul>
    </>
  );
}
