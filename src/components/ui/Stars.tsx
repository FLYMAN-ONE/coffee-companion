import { useI18n } from "../../i18n";
import { Icon } from "./Icon";

interface StarsProps {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "lg";
}

/** Rating 0–5. Empty stars use a muted sage with ≥ 3:1 contrast. */
export function Stars({ value, onChange, size = "lg" }: StarsProps) {
  const { t } = useI18n();
  const dim = size === "lg" ? "h-8 w-8" : "h-4 w-4";
  return (
    <div className="flex gap-0.5" role={onChange ? "radiogroup" : "img"} aria-label={t.common.rating(value)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Icon
            name="star"
            filled={n <= value}
            className={`${dim} ${n <= value ? "text-sage" : "text-[#5f6b52]"}`}
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? 0 : n)}
            className="press flex h-12 w-12 items-center justify-center rounded-xl"
            aria-label={t.common.stars(n)}
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}
