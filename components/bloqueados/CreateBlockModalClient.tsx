"use client";

import { cloneElement, isValidElement, useState } from "react";
import CreateBlockModal from "@/components/bloqueados/CreateBlockModal";

export default function CreateBlockModalClient({ trigger }: { trigger: React.ReactNode }) {
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
      <CreateBlockModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

