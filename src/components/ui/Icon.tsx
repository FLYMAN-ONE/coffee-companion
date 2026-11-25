import type { MethodId } from "../../types";

/** Line icons on a 24px grid, 2px round stroke. Method icons are drawn for this app. */
const paths = {
  // navigation
  prepare: ["M12 3.5C8.5 8 6.5 11 6.5 14a5.5 5.5 0 0 0 11 0c0-3-2-6-5.5-10.5z"],
  book: ["M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z", "M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"],
  journal: ["M8 3h8a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z", "M9 8h6M9 12h6M9 16h3"],
  settings: [
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "M12 2.5v3M12 18.5v3M4.2 6.5l2.6 1.5M17.2 16l2.6 1.5M4.2 17.5l2.6-1.5M17.2 8l2.6-1.5",
  ],
  dripper: [
    "M4 5h16l-6 8v1h-4v-1z",
    "M12 17.5c-.9 1.2-1.3 1.9-1.3 2.4a1.3 1.3 0 0 0 2.6 0c0-.5-.4-1.2-1.3-2.4z",
  ],
  // actions
  plus: ["M12 5v14M5 12h14"],
  minus: ["M5 12h14"],
  close: ["M18 6 6 18M6 6l12 12"],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  play: ["M7 4.5v15l13-7.5z"],
  pause: ["M8 5v14M16 5v14"],
  reset: ["M4 12a8 8 0 1 0 2.4-5.7", "M4 4v4h4"],
  skip: ["M6 5l9 7-9 7z", "M18 5v14"],
  stop: ["M9 6h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z"],
  edit: ["M4 20h4L19 9l-4-4L4 16z", "M13.5 6.5l4 4"],
  trash: ["M5 7h14M10 11v6M14 11v6M7 7l1 12h8l1-12M9.5 7V4.5h5V7"],
  star: ["M12 3.8l2.5 5.2 5.6.8-4 4 1 5.6L12 16.8l-5.1 2.6 1-5.6-4-4 5.6-.8z"],
  heart: ["M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"],
  download: ["M20 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3", "M7 10l5 5 5-5M12 15V3"],
  upload: ["M20 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3", "M17 8l-5-5-5 5M12 3v12"],
  left: ["M15 6l-6 6 6 6"],
  right: ["M9 6l6 6-6 6"],
  down: ["M6 9l6 6 6-6"],
  lock: [
    "M8 10.5h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z",
    "M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5",
  ],
  // facts
  thermo: ["M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"],
  clock: ["M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z", "M12 7.5V12l3 2"],
  grind: [
    "M8 7.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z",
    "M14 5.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z",
    "M11 12.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z",
    "M17 11.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z",
    "M8 16.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z",
    "M15 17.3a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z",
  ],
  // brewing methods
  v60: ["M3.5 6h17l-6.5 9h-4z", "M8 18.5h8", "M10 15v3.5M14 15v3.5"],
  chemex: ["M6 3.5h12l-4.5 8 4.5 8.5H6l4.5-8.5z", "M10.5 11.5h3", "M9 3.5l1.5 4"],
  aeropress: [
    "M9 7h6a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 15 20H9a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 9 7z",
    "M6 7h12M9 3.5h6V7M9.5 20.5h5",
  ],
  "french-press": [
    "M8 7.5h7a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2z",
    "M11.5 3.5v9M8.5 12.5h6M9 3.5h5M17 10h2v6h-2",
  ],
  moka: ["M7 20.5h10l-1.5-7h-7z", "M8.5 13.5l1-2.5h5l1 2.5", "M9.5 11l-1-6.5h7l-1 6.5M15.5 5.5l3 1.5"],
  espresso: [
    "M5 9h11v4.5a5.5 5.5 0 0 1-11 0z",
    "M16 10.5h1.5a2 2 0 0 1 0 4H16M4 20.5h13",
    "M9 3.5c-.8 1.2.8 2 0 3.2M12 3.5c-.8 1.2.8 2 0 3.2",
  ],
  "cold-brew": [
    "M7 6.5h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z",
    "M8.5 3.5h7v3h-7z",
    "M9.5 11h3v3h-3zM12.5 14.5H15V17h-2.5z",
  ],
  other: ["M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z", "M12 8v8M8 12h8"],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof paths;

interface IconProps {
  name: IconName | MethodId;
  className?: string;
  filled?: boolean;
}

export function Icon({ name, className = "h-6 w-6", filled = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled && name === "play" ? "none" : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {paths[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
