"use client";

import Image from "next/image";

export default function MCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffe4f0] via-[#f5e9ff] to-[#b7f7ea] text-[#1F2933] overflow-x-hidden">
      <div className="flex min-h-screen flex-col px-4 py-4 sm:px-4">
        <header className="mb-6 flex items-center justify-start">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="relative h-20 w-40 overflow-hidden sm:h-24 sm:w-48 cursor-pointer border-none bg-transparent p-0"
              aria-label="Reload page"
            >
              <Image
                src="/emmalogo.png"
                alt="EMMA logo"
                fill
                sizes="192px"
                className="object-contain"
                priority
              />
            </button>
          </div>
        </header>

        <main className="pb-4 sm:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
