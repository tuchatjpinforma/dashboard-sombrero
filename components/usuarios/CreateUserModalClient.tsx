"use client";

import { cloneElement, isValidElement, useState } from "react";
import CreateUserModal from "@/components/usuarios/CreateUserModal";

export default function CreateUserModalClient({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger as any, {
        onClick: (e: any) => {
          trigger.props?.onClick?.(e);
          setOpen(true);
        },
      })
    : trigger;

  return (
    <>
      {triggerEl}
      <CreateUserModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
