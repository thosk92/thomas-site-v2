"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

function swapLocale(path: string, target: "en" | "it"): string {
  // Normalize root
  if (!path || path === "/") return `/${target}`;
  const parts = path.split("?")[0].split("#")[0].split("/").filter(Boolean);
  if (parts.length === 0) return `/${target}`;
  if (parts[0] === "en" || parts[0] === "it") {
    parts[0] = target;
    return "/" + parts.join("/");
  }
  // If no locale prefix, prepend
  return `/${target}/` + parts.join("/");
}

export default function LanguageSwitch() {
  const pathname = usePathname() || "/";
  const isIt = pathname === "/it" || pathname.startsWith("/it/");
  const target = isIt ? "en" : "it";
  const href = swapLocale(pathname, target) as unknown as Route;
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-white transition"
      style={{ borderColor: "color-mix(in oklab,var(--foreground) 20%, transparent)", background: "rgba(255,255,255,0.7)" }}
      prefetch={false}
      aria-label={isIt ? "Switch to English" : "Passa all'italiano"}
    >
      {isIt ? "English" : "Italiano"}
    </Link>
  );
}
