"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Pill } from "@/components/Pill";
import { api } from "@/lib/api";
import { cn } from "@/utils/cn";
import {
  ArchiveBox,
  ClockClockwise,
  Copy,
  Pencil,
  Trash,
} from "@phosphor-icons/react";
import { UserRole } from "@prisma/client";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { CustomersWithUser } from "./page";
import { isEqual } from "date-fns";
import { copyToClipboard } from "@/utils/copyToClipboard";

interface CustomersListProps {
  customers: CustomersWithUser;
}

export function CustomersList({ customers }: CustomersListProps) {
  const session = useSession();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const copyCustomerLink = async (slug: string) => {
    try {
      const customerPage = window.location.origin.concat(`/clientes/${slug}/`);

      await copyToClipboard(customerPage);

      toast.success("Link da página do cliente copiado com sucesso!");
    } catch (error) {
      console.log(error);

      toast.error("Não foi possível copiar o link da página do cliente!");
    }
  };

  const editCustomer = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("id", id);
    router.replace(pathname.concat("?").concat(params.toString()));
  };

  const toggleArchiveCustomer = async (id: string, isArchived: boolean) => {
    if (!id) return;
    const isConfirmed = window.confirm(
      !isArchived
        ? "Você deseja arquivar o cliente?"
        : "Você deseja restaurar o cliente?"
    );
    if (!isConfirmed) return;

    const promise = async () => {
      try {
        await api.patch(`/customers/${id}/archive`);
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    toast.promise(promise, {
      pending: !isArchived ? "Arquivando..." : "Restaurando...",
      success: !isArchived
        ? "Cliente arquivado com sucesso!"
        : "Cliente restaurado com sucesso!",
      error: !isArchived
        ? "Não foi possível arquivar o cliente!"
        : "Não foi possível restaurar o cliente!",
    });
  };

  const deleteCustomer = async (id: string) => {
    if (!id) return;
    const isConfirmed = window.confirm("Você deseja remover o cliente?");
    if (!isConfirmed) return;

    const promise = async () => {
      try {
        await api.delete("/customers/".concat(id));
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    toast.promise(promise, {
      pending: "Removendo...",
      success: "Cliente removido com sucesso!",
      error: "Não foi possível remover o cliente!",
    });
  };

  return (
    <ul className="flex flex-col gap-6">
      {customers.map((customer) => {
        const isArchived = !!customer.archivedAt;

        return (
          <li
            key={customer.id}
            className={cn(
              "flex flex-col gap-3 p-5 bg-white rounded-xl drop-shadow-custom",
              {
                "opacity-50": isArchived,
              }
            )}
          >
            {session.data?.user.role === UserRole.ADMIN ? (
              <Pill>
                {(customer.updatedAt &&
                isEqual(customer.createdAt, customer.updatedAt)
                  ? "Criado por: "
                  : "Última atualização por: "
                ).concat(customer.updatedBy.name)}
              </Pill>
            ) : null}

            <div className="flex items-center justify-start gap-4">
              <h4 className="text-md font-semibold">{customer.name}</h4>

              {isArchived ? <Pill variant="tertiary">Arquivado</Pill> : null}

              <div className="flex gap-2 ml-auto">
                {!isArchived ? (
                  <>
                    <button
                      type="button"
                      title="Copiar link"
                      className="flex p-2 bg-primary text-white rounded-full"
                      onClick={() => copyCustomerLink(customer.slug)}
                    >
                      <Copy size={16} weight="bold" />
                    </button>

                    <button
                      type="button"
                      title="Editar"
                      className="flex p-2 bg-secondary text-white rounded-full"
                      onClick={() => editCustomer(customer.id)}
                    >
                      <Pencil size={16} weight="bold" />
                    </button>

                    <button
                      type="button"
                      title="Arquivar"
                      className="flex p-2 bg-shape-text text-text rounded-full"
                      onClick={() => toggleArchiveCustomer(customer.id, false)}
                    >
                      <ArchiveBox size={16} weight="bold" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      title="Restaurar"
                      className="flex p-2 bg-shape-text text-text rounded-full"
                      onClick={() => toggleArchiveCustomer(customer.id, true)}
                    >
                      <ClockClockwise size={16} weight="bold" />
                    </button>

                    <button
                      type="button"
                      title="Remover"
                      className="flex p-2 bg-tertiary text-white rounded-full"
                      onClick={() => deleteCustomer(customer.id)}
                    >
                      <Trash size={16} weight="bold" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <Link
              href={`/clientes/${customer.slug}`}
              className="flex w-fit px-4 py-2 bg-secondary text-xs font-semibold rounded-full"
            >
              Acessar
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
