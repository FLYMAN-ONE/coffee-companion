interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}

/** Small segmented control (settings). */
export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-2xl bg-raised p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`h-10 rounded-xl px-4 text-sm font-semibold transition-colors duration-200 ${
            value === o.id ? "bg-accent text-accent-ink" : "text-mute"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
