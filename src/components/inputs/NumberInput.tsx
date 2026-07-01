interface NumberInputProps {
  label?: string;
  value: number;
  unit: string;
  step: number;
  onChange: (value: number) => void;
}

export function NumberInput({
  label,
  value,
  unit,
  step,
  onChange
}: NumberInputProps) {
  return (
    <div className="flex flex-col gap-3">
      {label ? (
        <label className="
text-sm
text-[var(--text-secondary)]
">
          {label}
        </label>
      ) : null}

      <div className="
flex
items-center
gap-3
rounded-2xl
border
border-[var(--border)]
bg-[var(--bg-card-soft)]
px-4
py-3
transition
focus-within:border-[var(--accent)]
focus-within:shadow-[0_0_0_3px_rgba(157,187,120,0.14)]
">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) {
              onChange(v);
            }
          }}
          className="
flex-1
min-w-0
bg-transparent
text-3xl
font-semibold
text-[var(--text-primary)]
outline-none
"
        />

<span className="
text-xl
leading-none
text-[var(--text-secondary)]
shrink-0
self-end
mb-1
">
  {unit}
</span>
      </div>
    </div>
  );
}