"use client";

import Image from "next/image";

export default function MCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen emma-immersive-bg text-white overflow-x-hidden">
      <div className="flex min-h-screen flex-col px-4 py-4 sm:px-4">
        <main className="pb-4 sm:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
