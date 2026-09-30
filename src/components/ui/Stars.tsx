import { Icon } from "./Icon";
import { useI18n } from "../../i18n";

interface StarsProps {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "lg";
}

export function Stars({ value, onChange, size = "lg" }: StarsProps) {
  const { t } = useI18n();
  const dim = size === "lg" ? "h-9 w-9" : "h-4 w-4";
  return (
    <div className="flex gap-1" role={onChange ? "radiogroup" : "img"} aria-label={t.common.rating(value)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Icon
            name="star"
            filled={n <= value}
            className={`${dim} ${n <= value ? "text-accent" : "text-raise"}`}
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? 0 : n)}
            className="flex h-12 w-12 items-center justify-center rounded-xl active:bg-soft"
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
