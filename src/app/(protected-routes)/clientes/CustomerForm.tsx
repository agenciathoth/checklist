"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { Input } from "@/components/Input";
import { api } from "@/lib/api";
import {
  CreateCustomerSchema,
  createCustomerSchema,
} from "@/validators/customer";
import { zodResolver } from "@hookform/resolvers/zod";
import { Article, Link, User } from "@phosphor-icons/react";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { TextArea } from "@/components/TextArea";
import { CustomersWithUser } from "./page";

interface CustomerFormProps {
  customers: CustomersWithUser;
}

export function CustomerForm({ customers }: CustomerFormProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const customerId = searchParams.get("id");

  const selectedCustomer = customers.find(({ id }) => id === customerId);
  const isEditing = !!selectedCustomer;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCustomerSchema>({
    values: {
      name: selectedCustomer?.name || "",
      whatsapp: selectedCustomer?.whatsappLink || "",
      contract: selectedCustomer?.contractLink || "",
      gallery: selectedCustomer?.galleryLink || "",
      presentation: selectedCustomer?.presentation || "",
      schedule: selectedCustomer?.scheduleLink || "",
    },
    resolver: zodResolver(createCustomerSchema),
  });

  const cancelEditCustomer = () => {
    router.replace(pathname);
    reset();
  };

  const handleCreateCustomer = async (data: CreateCustomerSchema) => {
    try {
      isEditing && selectedCustomer
        ? await api.put(`customers/${selectedCustomer.id}`, data)
        : await api.post("customers", data);

      toast.success(
        !isEditing
          ? "Cliente criado com sucesso!"
          : "Cliente editado com sucesso!"
      );
      cancelEditCustomer();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data);
      }
    }
  };

  return (
    <form
      className="flex flex-col gap-8 w-full p-5 bg-white rounded-xl drop-shadow-custom"
      onSubmit={handleSubmit(handleCreateCustomer)}
    >
      <h2 className="font-bold text-lg">
        {isEditing ? "Edição de cliente" : "Cadastro de cliente"}
      </h2>

      <div className="flex flex-col gap-4">
        <Input
          icon={<User />}
          placeholder="Nome"
          error={errors.name?.message}
          {...register("name")}
        />

        <TextArea
          icon={<Article />}
          placeholder="Texto de apresentação"
          error={errors.presentation?.message}
          {...register("presentation")}
        />

        <Input
          icon={<Link />}
          placeholder="Link WhatsApp"
          error={errors.whatsapp?.message}
          {...register("whatsapp")}
        />

        <Input
          icon={<Link />}
          placeholder="Link Contrato"
          error={errors.contract?.message}
          {...register("contract")}
        />

        <Input
          icon={<Link />}
          placeholder="Link Fotografias"
          error={errors.gallery?.message}
          {...register("gallery")}
        />

        <Input
          icon={<Link />}
          placeholder="Link Planejamento"
          error={errors.schedule?.message}
          {...register("schedule")}
        />
      </div>

      <div className="flex justify-between">
        {isEditing ? (
          <button
            type="button"
            className="min-w-44 p-4 bg-shape-text text-text font-bold text-sm rounded-full uppercase disabled:opacity-50"
            onClick={cancelEditCustomer}
          >
            Cancelar
          </button>
        ) : null}

        <button
          type="submit"
          className="min-w-44 ml-auto p-4 bg-primary text-white font-bold text-sm rounded-full uppercase disabled:opacity-50"
        >
          {!isSubmitting
            ? !isEditing
              ? "Adicionar"
              : "Editar"
            : !isEditing
            ? "Adicionando..."
            : "Editando..."}
        </button>
      </div>
    </form>
  );
}
