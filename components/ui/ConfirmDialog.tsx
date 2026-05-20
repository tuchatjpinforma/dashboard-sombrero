"use client";

import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function ConfirmDialog({
  open,
  title,
  message,
  highlightedText,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  highlightedText?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const parts = highlightedText ? message.split(highlightedText) : [message];

  return (
    <Modal
      open={open}
      title={title}
      subtitle={undefined}
      icon={<AlertTriangle size={18} />}
      onClose={onCancel}
      maxWidthClassName="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-secondary">
        {highlightedText ? (
          <>
            {parts[0]}
            <span className="font-semibold text-text-primary">{highlightedText}</span>
            {parts.slice(1).join(highlightedText)}
          </>
        ) : (
          message
        )}
      </p>
    </Modal>
  );
}

