const paths = {
  coffee: [
    "M17 8h1a4 4 0 0 1 0 8h-1",
    "M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z",
    "M7 2v3M11 2v3M15 2v3",
  ],
  book: [
    "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z",
    "M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
  ],
  timer: ["M12 6a8 8 0 1 0 0 16 8 8 0 0 0 0-16z", "M12 14v-4M9 2h6"],
  log: [
    "M8 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8z",
    "M8 2v20M4 6h4M4 10h4M4 14h4M12 8h5",
  ],
  plus: ["M12 5v14M5 12h14"],
  minus: ["M5 12h14"],
  close: ["M18 6 6 18M6 6l12 12"],
  check: ["M20 6 9 17l-5-5"],
  play: ["M6 4l14 8-14 8z"],
  pause: ["M8 5v14M16 5v14"],
  reset: ["M3 12a9 9 0 1 0 3-6.7L3 8", "M3 3v5h5"],
  skip: ["M5 4l10 8-10 8z", "M19 5v14"],
  edit: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"],
  trash: ["M3 6h18M8 6V4h8v2", "M6 6l1 14h10l1-14M10 11v6M14 11v6"],
  star: ["M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z"],
  heart: [
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z",
  ],
  download: [
    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
    "M7 10l5 5 5-5M12 15V3",
  ],
  upload: [
    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
    "M17 8l-5-5-5 5M12 3v12",
  ],
  droplet: ["M12 2.7s7 7.2 7 12a7 7 0 0 1-14 0c0-4.8 7-12 7-12z"],
  thermo: ["M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"],
  copy: ["M9 9h11v11H9z", "M5 15V5h10"],
  up: ["M6 15l6-6 6 6"],
  down: ["M6 9l6 6 6-6"],
  flag: ["M4 22V4", "M4 4h13l-2 4 2 4H4"],
} as const;

export type IconName = keyof typeof paths;

interface IconProps {
  name: IconName;
  className?: string;
  filled?: boolean;
}

export function Icon({ name, className = "h-6 w-6", filled = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
