"use client";

import Image from "next/image";
import Link from "next/link";

export default function MCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen emma-immersive-bg text-white overflow-x-hidden">
      <div className="flex min-h-screen flex-col px-4 py-3 sm:px-4">
        <header className="mb-4 flex items-center justify-center">
          <Link href="/emma" className="flex items-center justify-center">
            <div className="emma-logo-breath flex h-32 w-32 items-center justify-center">
              <Image
                src="/logo-emma-bianco.png"
                alt="EMMA home"
                width={140}
                height={140}
                className="h-24 w-24 object-contain"
              />
            </div>
          </Link>
        </header>

        <main className="pb-4 sm:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
