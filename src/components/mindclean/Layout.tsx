"use client";

import Image from "next/image";
import Link from "next/link";

export default function MCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen emma-immersive-bg text-white overflow-x-hidden">
      <div className="flex min-h-screen flex-col px-4 py-1 sm:px-4 sm:py-3">
        <header className="mb-0 sm:mb-1 flex items-center justify-center">
          <Link href="/" className="flex items-center justify-center">
            <div className="emma-logo-breath flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center">
              <Image
                src="/logo-emma-bianco.png"
                alt="EMMA home"
                width={180}
                height={180}
                className="h-24 w-24 sm:h-32 sm:w-32 object-contain"
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
