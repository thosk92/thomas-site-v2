"use client";

import Image from "next/image";
import Link from "next/link";

export default function MCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen emma-immersive-bg text-white overflow-x-hidden">
      <div className="flex min-h-screen flex-col px-4 pt-0 pb-0 sm:px-4 sm:pt-1 sm:pb-0">
        <header className="mb-0 flex items-center justify-center">
          <Link href="/" className="flex items-center justify-center">
            <div className="logo-glow emma-logo-breath flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center">
              <Image
                src="/logo-emma-bianco.png"
                alt="EMMA home"
                width={210}
                height={210}
                className="h-28 w-28 sm:h-36 sm:w-36 object-contain"
              />
            </div>
          </Link>
        </header>

        <main className="-mt-3 sm:-mt-4 pb-4 sm:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
