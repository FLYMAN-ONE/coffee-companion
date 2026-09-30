interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  label: string;
}

export function Slider({ value, min, max, step, onChange, label }: SliderProps) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <input
      type="range"
      className="slider"
      aria-label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      style={{ "--pct": `${pct}%` } as React.CSSProperties}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
