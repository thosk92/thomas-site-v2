"use client";

import Image from "next/image";

export default function MCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffe4f0] via-[#f5e9ff] to-[#b7f7ea] text-[#1F2933] overflow-x-hidden">
      <div className="mx-auto grid min-h-screen max-w-5xl grid-rows-[auto_1fr] px-5 py-4 sm:px-6 lg:px-10 lg:py-6">
        <header className="mb-6 flex items-center justify-start pl-2 sm:pl-0">
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
