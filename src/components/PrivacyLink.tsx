"use client";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

export default function PrivacyLink({ className }: { className?: string }) {
  const pathname = usePathname() || "/";
  const isIt = pathname === "/it" || pathname.startsWith("/it/");
  const href = (isIt ? "/it/privacy" : "/en/privacy") as Route;
  const label = isIt ? "Informativa sulla Privacy" : "Privacy Policy";
  return (
    <Link href={href} className={className} prefetch={false}>
      {label}
    </Link>
  );
}
