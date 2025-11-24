import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

export default function Card({ children, className = "" }: Props) {
  return (
    <div
      className={
        "rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 sm:px-5 sm:py-4 shadow-[0_14px_40px_rgba(31,58,95,0.06)] " +
        className
      }
    >
      {children}
    </div>
  );
}
