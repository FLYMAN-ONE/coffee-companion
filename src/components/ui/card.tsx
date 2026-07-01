import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({
  children,
  className = ""
}: CardProps) {

  return (
    <div
      className={`
        rounded-3xl
        bg-white
        shadow-sm
        p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}