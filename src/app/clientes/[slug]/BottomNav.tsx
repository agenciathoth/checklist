"use client";

import { cn } from "@/utils/cn";
import {
  CalendarBlank,
  Camera,
  FileText,
  WhatsappLogo,
} from "@phosphor-icons/react";

interface NavButtonProps {
  label?: string;
  url?: string | null;
  icon: JSX.Element;
}

const NavButton = ({ url, icon, label }: NavButtonProps) => {
  return (
    <a
      href={url ?? "#"}
      target="_blank"
      data-disabled={!url}
      className={cn("flex", {
        "cursor-not-allowed opacity-50 pointer-events-none": !url,
      })}
    >
      {icon}
      {label ? <span className="sr-only">{label}</span> : null}
    </a>
  );
};

interface BottomNavProps {
  whatsappLink?: string | null;
  contractLink?: string | null;
  galleryLink?: string | null;
  scheduleLink?: string | null;
}

export function BottomNav({
  whatsappLink,
  contractLink,
  galleryLink,
  scheduleLink,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-4 left-4 right-4 max-w-[800px] mx-auto px-8 py-5 bg-secondary text-white rounded-full z-10">
      <ul className="flex items-center justify-between">
        <li>
          <NavButton
            label="WhatsApp"
            url={whatsappLink || "https://wa.me/+5571991059295"}
            icon={<WhatsappLogo weight="bold" size={24} />}
          />
        </li>

        <li>
          <NavButton
            label="Contrato"
            url={contractLink}
            icon={<FileText weight="bold" size={24} />}
          />
        </li>

        <li>
          <NavButton
            label="Fotografias"
            url={galleryLink}
            icon={<Camera weight="bold" size={24} />}
          />
        </li>

        <li>
          <NavButton
            label="Planejamento"
            url={scheduleLink}
            icon={<CalendarBlank weight="bold" size={24} />}
          />
        </li>
      </ul>
    </nav>
  );
}
