import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { Button } from "./Button";

interface ConfirmButtonProps {
  label: string;
  onConfirm: () => void;
}

/** Two-tap delete: the first tap arms it for 3 s, the second confirms. */
export function ConfirmButton({ label, onConfirm }: ConfirmButtonProps) {
  const { t } = useI18n();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);

  return (
    <Button variant="danger" icon="trash" onClick={() => (armed ? onConfirm() : setArmed(true))}>
      {armed ? t.common.confirmDelete : label}
    </Button>
  );
}
