"use client";

import Image from "next/image";
import Link from "next/link";

export default function MCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen emma-immersive-bg text-white overflow-x-hidden">
      <div className="flex min-h-screen flex-col px-4 py-2 sm:px-4">
        <header className="mb-1 flex items-center justify-center">
          <Link href="/emma" className="flex items-center justify-center">
            <div className="emma-logo-breath flex h-40 w-40 items-center justify-center">
              <Image
                src="/logo-emma-bianco.png"
                alt="EMMA home"
                width={180}
                height={180}
                className="h-32 w-32 object-contain"
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
