import { useEffect, useState } from "react";
import { Button } from "./Button";

interface ConfirmButtonProps {
  label: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

/** Two-tap delete: first tap arms it, second tap confirms. */
export function ConfirmButton({
  label,
  confirmLabel = "Tap again to confirm",
  onConfirm,
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);

  return (
    <Button
      variant="danger"
      icon="trash"
      onClick={() => (armed ? onConfirm() : setArmed(true))}
    >
      {armed ? confirmLabel : label}
    </Button>
  );
}
